const XLSX = require('./node_modules/xlsx');
const path = require('path');

const wbS = XLSX.readFile('../Sales Analysis New (2026-07-13).xlsx');
const sales = XLSX.utils.sheet_to_json(wbS.Sheets[wbS.SheetNames[0]]);

const wbA = XLSX.readFile('../Aged Past Due by sales Person(New) (2026-07-14).xlsx');
const aged = XLSX.utils.sheet_to_json(wbA.Sheets[wbA.SheetNames[0]]);

const wbP = XLSX.readFile('../All Payment (2026-07-14).xlsx');
const payments = XLSX.utils.sheet_to_json(wbP.Sheets[wbP.SheetNames[0]]);

console.log('=== 1. SALES OVERVIEW ===');
const totalSales = sales.reduce((acc, r) => acc + (Number(r['Sales Without Tax']) || 0), 0);
const totalProfit = sales.reduce((acc, r) => acc + (Number(r['Profit Margin']) || 0), 0);
console.log('Total Sales (without tax):', totalSales.toFixed(2), 'EGP');
console.log('Total Profit:', totalProfit.toFixed(2), 'EGP');
console.log('Overall Margin:', ((totalProfit / totalSales) * 100).toFixed(2) + '%');

// Customer Analysis
const custMap = {};
sales.forEach(r => {
  const c = (r.Customer || 'Unknown').trim();
  if (!custMap[c]) custMap[c] = { sales: 0, profit: 0, count: 0, items: 0, accSales: 0, hwSales: 0, phone: r['Customer ID'] || r['Phone Nbr'] || '' };
  const s = Number(r['Sales Without Tax']) || 0;
  const p = Number(r['Profit Margin']) || 0;
  custMap[c].sales += s;
  custMap[c].profit += p;
  custMap[c].count += 1;
  const cls = (r['Item Class Name'] || '').toLowerCase();
  if (cls.includes('acc') || cls.includes('accessories')) custMap[c].accSales += s;
  else custMap[c].hwSales += s;
});

const sortedCusts = Object.entries(custMap).map(([name, d]) => ({
  name,
  sales: d.sales,
  profit: d.profit,
  marginPct: d.sales > 0 ? (d.profit / d.sales) * 100 : 0,
  orders: d.count,
  accSales: d.accSales,
  hwSales: d.hwSales,
  phone: d.phone
})).sort((a,b) => b.sales - a.sales);

console.log('\nTop 10 Customers by Volume:');
sortedCusts.slice(0, 10).forEach((c, idx) => {
  console.log(`${idx+1}. ${c.name} (${c.phone}): Sales=${c.sales.toLocaleString()} EGP | Profit=${c.profit.toLocaleString()} EGP | Margin=${c.marginPct.toFixed(2)}% | Acc=${c.accSales.toLocaleString()} | HW=${c.hwSales.toLocaleString()}`);
});

console.log('\nCustomers with Critical Low Margin (< 2%):');
sortedCusts.filter(c => c.marginPct < 2).forEach(c => {
  console.log(`- ⚠️ ${c.name}: Sales=${c.sales.toLocaleString()} EGP | Margin=${c.marginPct.toFixed(2)}% (Profit: ${c.profit.toLocaleString()} EGP)`);
});

console.log('\n=== 2. AGED PAST DUE / OVERDUE DEBT ANALYSIS ===');
let totalDebt = 0;
let bucket0_30 = 0, bucket30_60 = 0, bucket60_90 = 0, bucket90_plus = 0;
const debtorMap = {};

aged.forEach(r => {
  const c = (r.Name || r.Customer || 'Unknown').trim();
  const bal = Number(r['Balance']) || 0;
  const days = Number(r['Days Diff.'] || r['Nbr Of Days (Due Date)']) || 0;
  totalDebt += bal;
  if (days > 90) bucket90_plus += bal;
  else if (days > 60) bucket60_90 += bal;
  else if (days > 30) bucket30_60 += bal;
  else bucket0_30 += bal;

  if (!debtorMap[c]) debtorMap[c] = { balance: 0, maxDays: 0, invoices: 0, rep: r['Sales Person'] || '', area: r['Customer Class'] || '' };
  debtorMap[c].balance += bal;
  debtorMap[c].invoices += 1;
  if (days > debtorMap[c].maxDays) debtorMap[c].maxDays = days;
});

console.log('Total Overdue Receivables:', totalDebt.toLocaleString(), 'EGP');
console.log('- 0 to 30 Days:', bucket0_30.toLocaleString(), 'EGP');
console.log('- 31 to 60 Days:', bucket30_60.toLocaleString(), 'EGP');
console.log('- 61 to 90 Days:', bucket60_90.toLocaleString(), 'EGP');
console.log('- >90 Days (High Risk Bad Debt):', bucket90_plus.toLocaleString(), 'EGP');

console.log('\nTop Critical Debtors (Balance > 50,000 EGP):');
Object.entries(debtorMap)
  .map(([name, d]) => ({ name, ...d }))
  .sort((a,b) => b.balance - a.balance)
  .filter(d => d.balance >= 50000)
  .forEach(d => {
    const isBuying = custMap[d.name] ? '🟢 Active Buyer' : '🔴 DORMANT / STOPPED BUYING';
    console.log(`- ${d.name} (${d.area}): Balance=${d.balance.toLocaleString()} EGP | Invoices=${d.invoices} | Max Overdue Days=${d.maxDays} | ${isBuying}`);
  });

console.log('\n=== 3. DORMANT & INACTIVE ACCOUNTS WITH DEBTS ===');
const dormantWithDebt = Object.keys(debtorMap).filter(name => !custMap[name]);
console.log(`Total Inactive Clients Owing Money (0 purchases this period): ${dormantWithDebt.length}`);
dormantWithDebt.slice(0, 15).forEach(name => {
  const d = debtorMap[name];
  console.log(`- 🔴 ${name} (${d.area}): Balance=${d.balance.toLocaleString()} EGP | Overdue Days=${d.maxDays}`);
});

console.log('\n=== 4. PAYMENTS & COLLECTIONS ===');
const totalPaid = payments.reduce((acc, r) => acc + (Number(r['Amount']) || 0), 0);
console.log('Total Payments in Period:', totalPaid.toLocaleString(), 'EGP across', payments.length, 'transactions');
console.log('Collection Coverage Rate (Paid vs Overdue):', ((totalPaid / totalDebt) * 100).toFixed(2) + '%');

const fs = require('fs');

const cssFix = `
<style id="sidebar-overlap-fix">
/* --- Sidebar Overlap Fix --- */
@media (min-width: 901px) {
  body:not(.en) .mw {
    width: calc(100% - 312px) !important;
    max-width: calc(100% - 312px) !important;
    margin-right: 312px !important;
    margin-left: 0 !important;
  }
  body.en .mw {
    width: calc(100% - 312px) !important;
    max-width: calc(100% - 312px) !important;
    margin-left: 312px !important;
    margin-right: 0 !important;
  }
}
@media (max-width: 900px) {
  .mw {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }
}
</style>
`;

const files = fs.readdirSync('.');
let count = 0;
files.forEach(file => {
    if (file.endsWith('.html')) {
        let content = fs.readFileSync(file, 'utf8');
        if (!content.includes('id="sidebar-overlap-fix"')) {
            content = content.replace('</head>', cssFix + '</head>');
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed ' + file);
            count++;
        }
    }
});
console.log('Total fixed: ' + count);

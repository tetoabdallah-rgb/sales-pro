$files = Get-ChildItem -Path "e:\AI\apk\SalesProWeb" -Filter "*.html"

$cssFix = @"
    /* Fix Grid and Flexbox blowout bugs caused by long product names */
    .cg > *, .kg > *, .rg-grid > *, .card {
      min-width: 0 !important;
    }
    div[style*="display:flex"] > span[style*="ellipsis"],
    div[style*="display: flex"] > span[style*="ellipsis"],
    span[style*="ellipsis"] {
      min-width: 0 !important;
    }
"@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Inject into the existing ultimate-layout-fix
    $content = $content -replace '(\.mw\s*\{[^}]+\})', "`$1`n$cssFix"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Injected grid/flex blowout fix into all HTML files."

$files = Get-ChildItem -Path "e:\AI\apk\SalesProWeb" -Filter "*.html"

$newFix = @"
<style id="ultimate-layout-fix">
  @media screen and (min-width: 901px) {
    #APP::before {
      content: "";
      display: block;
      width: 280px !important;
      flex-shrink: 0 !important;
    }
    .mw {
      margin: 0 !important;
      padding: 24px 32px !important;
      width: auto !important;
      max-width: none !important;
      flex: 1 1 0% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }
  }
</style>
"@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove the old fix wherever it is
    $content = $content -replace '(?s)<style id="ultimate-layout-fix">.*?</style>\s*', ''
    
    # Replace the FIRST </head> with the new fix
    $content = [regex]::Replace($content, '(?i)</head>', "`n$newFix`n</head>", 1)
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Injected new Flexbox layout fix to all HTML files."

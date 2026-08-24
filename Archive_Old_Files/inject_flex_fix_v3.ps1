$files = Get-ChildItem -Path "e:\AI\apk\SalesProWeb" -Filter "*.html"

$newFix = @"
<style id="ultimate-layout-fix">
  @media screen and (min-width: 901px) {
    #APP {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }
    .mw {
      margin: 0 !important;
      padding: 24px 32px !important;
      padding-right: 312px !important; 
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }
    body.en .mw {
      padding-right: 32px !important;
      padding-left: 312px !important;
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

Write-Host "Injected fallback block-layout fix to all HTML files."

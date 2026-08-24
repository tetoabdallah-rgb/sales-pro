# bundle.ps1 - Bundles local JS/CSS into a single index_bundle.html
$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Get-Content -Path "$dir\index.html" -Raw -Encoding UTF8

# 1) Inline the CSS: replace <link rel="stylesheet" href="style.css?v=...">
$cssContent = Get-Content -Path "$dir\style.css" -Raw -Encoding UTF8
$html = $html -replace '<link\s+rel="stylesheet"\s+href="style\.css\?v=[^"]*"\s*>', "<style>`n$cssContent`n</style>"

# 2) Inline each local JS file
$localScripts = @(
    'firebase-config.js',
    'data-store.js',
    'auth.js',
    'ui-components.js',
    'settings.js',
    'app.js',
    'gdrive.js'
)

foreach ($script in $localScripts) {
    $jsContent = Get-Content -Path "$dir\$script" -Raw -Encoding UTF8
    # Escape dollar signs so they aren't treated as regex replacement group refs
    $jsContentEscaped = $jsContent.Replace('$', '$$')
    $pattern = [regex]::Escape("<script src=`"$script") + '\?v=[^"]*">\s*</script>'
    $replacement = "<script>`n$jsContentEscaped`n</script>"
    $html = [regex]::Replace($html, $pattern, $replacement)
}

# 3) Write the bundled file (UTF8 without BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$dir\index_bundle.html", $html, $utf8NoBom)

$size = (Get-Item "$dir\index_bundle.html").Length
Write-Host "SUCCESS: index_bundle.html created ($size bytes)"

$ErrorActionPreference = 'Stop'

$owner = "tetoabdallah-rgb"
$repo = "sales-pro"
$branch = "main"

$envPath = Join-Path $HOME ".env"
$token = $null
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    foreach ($line in $envContent) {
        if ($line -match "^GITHUB_TOKEN=(.*)") {
            $token = $matches[1].Trim()
        }
    }
}

if (-not $token) {
    Write-Host "No token provided. Exiting."
    exit 1
}

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "SalesPro-Uploader"
}

$files = @("index.html", "new_features.js", "stock.js", "style.css", "service-worker.js", "sw.js", "manifest.json", "styles/main.css", "scripts/main.js", "styles/dashboard-v2.css", "styles/landing.css", "styles/modern-ui.css", "premium_ux.js", "quick_search.js", "customer_reports.js", "appearance_settings.js", "sales_booster.js", "auth.js")

foreach ($file in $files) {
    Write-Host "Uploading $file to GitHub ..." -ForegroundColor Yellow
    $filePath = Join-Path $PWD $file
    if (-not (Test-Path $filePath)) { continue }
    
    $content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($filePath))
    $apiUrl = "https://api.github.com/repos/$owner/$repo/contents/$file"
    
    $sha = $null
    try {
        $existing = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $existing.sha
    } catch {
        Write-Host "  Get SHA FAILED for $file" -ForegroundColor Yellow
    }

    $body = @{
        message = "feat: Update dashboard UI with new design"
        content = $content
        branch = $branch
    }
    if ($sha) { $body.sha = $sha }
    $jsonBody = $body | ConvertTo-Json -Depth 5

    try {
        $result = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "  SUCCESS! Uploaded $file" -ForegroundColor Green
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) { Write-Host "  DETAILS: $($_.ErrorDetails.Message)" -ForegroundColor Red }
    }
}

Write-Host "Visit: https://$owner.github.io/$repo/index.html" -ForegroundColor Green


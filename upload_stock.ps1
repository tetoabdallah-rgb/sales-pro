$ErrorActionPreference = 'Stop'

$owner = "tetoabdallah-rgb"
$repo  = "sales-pro"
$branch = "main"

# Load token from .env or prompt
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
if (-not $token) { $token = Read-Host "Paste your GitHub Personal Access Token (ghp_...)" }
if (-not $token) { Write-Host "No token provided. Exiting."; exit 1 }

$headers = @{
    "Authorization" = "token $token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "SalesPro-Uploader"
}

# Files to upload (relative paths)
$files = @("stock.js", "scripts/main.js", "index.html")

foreach ($file in $files) {
    $filePath = Join-Path $PWD $file
    if (-not (Test-Path $filePath)) { Write-Host "  SKIP (not found): $file" -ForegroundColor Yellow; continue }

    Write-Host "`nUploading $file ..." -ForegroundColor Yellow
    $content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($filePath))
    $apiUrl  = "https://api.github.com/repos/$owner/$repo/contents/$file"
    $sha = $null

    try {
        $existing = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        $sha = $existing.sha
    } catch {
        Write-Host "  (new file or SHA fetch failed)" -ForegroundColor DarkGray
    }

    $body = @{
        message = "feat: add Stock/Inventory tab with PDF catalog export"
        content = $content
        branch  = $branch
    }
    if ($sha) { $body.sha = $sha }
    $jsonBody = $body | ConvertTo-Json -Depth 5

    try {
        $result = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
        Write-Host "  SUCCESS: $file" -ForegroundColor Green
    } catch {
        Write-Host "  FAILED: $file - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) { Write-Host "  DETAILS: $($_.ErrorDetails.Message)" -ForegroundColor Red }
    }
}

Write-Host "`nDone! Visit: https://$owner.github.io/$repo/index.html" -ForegroundColor Cyan

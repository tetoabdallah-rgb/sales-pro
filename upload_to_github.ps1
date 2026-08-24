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
    $token = Read-Host "Paste your GitHub Personal Access Token (ghp_...)"
}

if (-not $token) { Write-Host "No token provided. Exiting."; exit 1 }

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "SalesPro-Uploader"
}

Write-Host "
Uploading index.html to GitHub ..." -ForegroundColor Yellow
$filePath = Join-Path $PWD "index.html"
$content = [Convert]::ToBase64String([IO.File]::ReadAllBytes($filePath))

$apiUrl = "https://api.github.com/repos/$owner/$repo/contents/index.html"
$sha = $null
try {
    $existing = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
    $sha = $existing.sha
} catch {
    Write-Host "  Get SHA FAILED: $($_.Exception.Message)" -ForegroundColor Yellow
}

$body = @{
    message = "feat: add accessories and hardware collections to dashboard"
    content = $content
    branch = $branch
}
if ($sha) { $body.sha = $sha }
$jsonBody = $body | ConvertTo-Json -Depth 5

try {
    $result = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Put -Body $jsonBody -ContentType "application/json"
    Write-Host "  SUCCESS! Uploaded to index.html" -ForegroundColor Green
} catch {
    Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) { Write-Host "  DETAILS: $($_.ErrorDetails.Message)" -ForegroundColor Red }
    else { try { $stream = $_.Exception.Response.GetResponseStream(); $reader = New-Object System.IO.StreamReader($stream); Write-Host "  DETAILS: $($reader.ReadToEnd())" -ForegroundColor Red } catch {} }
}

Write-Host "Visit: https://$owner.github.io/$repo/index.html" -ForegroundColor Green

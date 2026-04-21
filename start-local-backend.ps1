param(
    [string]$BackendDir = "$PSScriptRoot\backend",
    [int]$Port = 5000,
    [string]$Subdomain = "bmm-erp-backend"
)

function Write-Log([string]$text) {
    Write-Host "[start-local-backend] $text"
}

$backendPath = Resolve-Path -Path $BackendDir
if (-not (Test-Path $backendPath)) {
    Write-Error "Backend folder not found: $backendPath"
    exit 1
}

$envFile = Join-Path $PSScriptRoot "frontend/.env.local"
if (-not (Test-Path $envFile)) {
    @"
VITE_API_BASE_URL=http://localhost:$Port
"@ | Out-File -FilePath $envFile -Encoding utf8
    Write-Log "Created frontend/.env.local with local backend URL."
} else {
    Write-Log "frontend/.env.local already exists. Update it manually if needed."
}

$backendCommand = "Set-Location '$backendPath'; if (-not (Test-Path node_modules)) { npm install }; npm run dev"
$tunnelCommand = "Set-Location '$backendPath'; npx localtunnel --port $Port --subdomain $Subdomain"

Write-Log "Opening backend terminal..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCommand

Start-Sleep -Seconds 1
Write-Log "Opening tunnel terminal..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', $tunnelCommand

Write-Log "Done. Two console windows are open."
Write-Log "Backend should start on http://localhost:$Port and tunnel will print the public URL." 
Write-Log "If the subdomain is unavailable, rerun the script with a different --Subdomain value."
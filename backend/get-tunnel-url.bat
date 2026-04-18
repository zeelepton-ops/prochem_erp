@echo off
echo Starting localtunnel and capturing URL...
powershell -Command "& { $process = Start-Process -FilePath 'npx' -ArgumentList 'localtunnel --port 5000' -NoNewWindow -PassThru -RedirectStandardOutput 'tunnel_output.txt'; Start-Sleep 5; $url = Get-Content 'tunnel_output.txt' | Select-String 'your url is:' | ForEach-Object { $_.Line -replace 'your url is: ', '' }; Write-Host 'Tunnel URL:' $url; Remove-Item 'tunnel_output.txt' -ErrorAction SilentlyContinue }"
pause
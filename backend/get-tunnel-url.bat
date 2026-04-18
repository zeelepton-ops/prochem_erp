@echo off
echo Starting localtunnel and capturing URL...
powershell -Command "& { $process = Start-Process -FilePath 'cmd' -ArgumentList '/c npx localtunnel --port 5000 ^> tunnel_output.txt 2^>^&1' -NoNewWindow -PassThru; Start-Sleep 10; $url = Get-Content 'tunnel_output.txt' | Select-String 'your url is:' | ForEach-Object { $_.Line -replace 'your url is: ', '' } | Select-Object -First 1; if ($url) { Write-Host 'Tunnel URL:' $url } else { Write-Host 'URL not found, check tunnel_output.txt' }; Remove-Item 'tunnel_output.txt' -ErrorAction SilentlyContinue }"
pause
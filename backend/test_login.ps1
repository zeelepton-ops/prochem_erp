$body = '{"email":"admin@bmm.local","password":"admin123"}'
$headers = @{"Content-Type" = "application/json"}
try {
  $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/auth/login' -Method Post -Headers $headers -Body $body
  Write-Output "Success!"
  Write-Output $response.Content
} catch {
  Write-Output "Error!"
  Write-Output $_.Exception.Response.Content
}

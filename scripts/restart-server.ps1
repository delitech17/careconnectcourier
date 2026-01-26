# Kill whatever is using port 3000 and start the node server
$port = 3000
$pids = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) -ne $null
if ($pids) {
  $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Select-Object -Unique
  foreach ($pid in $pids) {
    try { Stop-Process -Id $pid -Force -ErrorAction Stop; Write-Host "Stopped PID $pid on port $port" }
    catch { Write-Warning "Failed to stop PID $pid: $_" }
  }
} else {
  Write-Host "No process found on port $port"
}

Set-Location -Path (Join-Path $PSScriptRoot '..\node_server')
Write-Host "Starting server..."
npm start

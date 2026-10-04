$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$bat = Join-Path $dir "iniciar-sincronizador.bat"
$taskName = "Farmacia Mais Economica - Sync Pharmagno"
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$bat`"" -WorkingDirectory $dir
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 20 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force | Out-Null
Write-Host "Tarefa criada: $taskName"
Write-Host "O sincronizador sera iniciado automaticamente junto com o Windows."

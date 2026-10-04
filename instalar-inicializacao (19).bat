@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Este passo precisa de permissao de Administrador.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar-inicializacao.ps1"
if errorlevel 1 (
  echo.
  echo Nao foi possivel criar a tarefa. Clique com o botao direito neste arquivo e escolha "Executar como administrador".
)
pause

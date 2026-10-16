@echo off
chcp 65001 >nul
title Teste Pharmagno - sem alterar dados
cd /d "%~dp0"
node index.js --once --dry-run
 echo.
echo Se aparecer "Concluido" sem ERRO, a leitura do Pharmagno e do Supabase funcionou.
pause

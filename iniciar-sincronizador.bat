@echo off
chcp 65001 >nul
title Farmácia Mais Econômica - Sincronização Automática
cd /d "%~dp0"
node index.js
pause

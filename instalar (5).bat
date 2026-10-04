@echo off
chcp 65001 >nul
title Farmácia Mais Econômica - Instalação do Sincronizador
cd /d "%~dp0"
echo.
echo ================================================
echo   SINCRONIZADOR PHARMAGNO -> SITE
 echo ================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale o Node.js 18 ou superior e execute este arquivo novamente.
  pause
  exit /b 1
)
if not exist .env (
  copy /Y .env.example .env >nul
  echo Arquivo .env criado. Abra-o e preencha a senha do Firebird e a chave service_role do Supabase.
)
echo Instalando dependencias...
call npm install
if errorlevel 1 (
  echo Falha ao instalar dependencias.
  pause
  exit /b 1
)
echo.
echo Instalacao concluida.
echo 1. Configure o arquivo .env
 echo 2. Rode testar-conexao.bat
 echo 3. Depois rode iniciar-sincronizador.bat
pause

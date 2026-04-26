@echo off
cd /d "C:\projetos\Sist. Etiquetas"

echo Iniciando Sistema de Etiquetas...

:: evita abrir duas vezes
tasklist | findstr /i "electron.exe" > nul
if %errorlevel%==0 (
    echo Sistema ja esta aberto.
    exit
)

:: inicia o Electron diretamente
start "" ".\node_modules\electron\dist\electron.exe" ".\electron.js"

exit
@echo off
REM Establece el tÃ­tulo de la ventana de la consola para identificar fÃ¡cilmente el bot.
title Chatbot de WhatsApp

REM Cambia al directorio donde se encuentra tu proyecto.
cd /d "C:\Users\FLUGE\Desktop\chatbot"

REM Inicia el servicio de Ollama en segundo plano (si no estÃ¡ ya activo)
echo "Asegurando que el servicio de Ollama estÃ© activo..."
start /b ollama serve

REM Espera un momento para que el servicio de Ollama estÃ© completamente listo
timeout /t 15 /nobreak >nul

REM Ejecuta el comando de inicio definido en tu package.json.
echo "Iniciando el bot de WhatsApp..."
start "WhatsApp Bot Server" /b call pnpm run start
timeout /t 5 /nobreak >nul
start http://localhost:3002
echo "El servidor del bot se está ejecutando en segundo plano."
echo "Puedes cerrar esta ventana, pero el servidor seguirá funcionando."

REM Mantiene la ventana abierta para que puedas ver los errores.
pause
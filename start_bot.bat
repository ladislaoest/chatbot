@echo off
REM Establece el tÃ­tulo de la ventana de la consola para identificar fÃ¡cilmente el bot.
title Chatbot de WhatsApp

REM Cambia al directorio donde se encuentra tu proyecto.
cd /d "C:\Users\FLUGE\Desktop\chatbot"



REM Ejecuta el comando de inicio definido en tu package.json.
echo "Iniciando el bot de WhatsApp..."
call pnpm run start

REM Mantiene la ventana abierta para que puedas ver los errores.
pause
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-button');
  const statusDiv = document.getElementById('status');

  let isBotOn = false;

  toggleButton.addEventListener('click', async () => {
    if (isBotOn) {
      // Turn the bot off
      await fetch('/stop-bot');
      toggleButton.textContent = 'Encender';
      toggleButton.classList.remove('off');
      statusDiv.textContent = 'Estado: Apagado';
    } else {
      // Turn the bot on
      await fetch('/start-bot');
      toggleButton.textContent = 'Apagar';
      toggleButton.classList.add('off');
      statusDiv.textContent = 'Estado: Encendido';
    }
    isBotOn = !isBotOn;
  });
});

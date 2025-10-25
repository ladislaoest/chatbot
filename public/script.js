document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-button');
  const statusDiv = document.getElementById('status');
  const appointmentsList = document.getElementById('appointments-list');
  const editModal = document.getElementById('edit-modal');
  const closeButton = document.querySelector('.close-button');
  const editIdInput = document.getElementById('edit-id');
  const editDateInput = document.getElementById('edit-date');
  const editDescriptionInput = document.getElementById('edit-description');
  const saveButton = document.getElementById('save-button');

  let isBotOn = false;

  // Function to fetch and display appointments
  const fetchAppointments = async () => {
    const response = await fetch('/api/appointments');
    const appointments = await response.json();
    appointmentsList.innerHTML = '';
    appointments.forEach(app => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${new Date(app.date).toLocaleString()} - ${app.description}</span>
        <div class="appointment-actions">
          <button data-id="${app.id}" class="edit-button">Editar</button>
          <button data-id="${app.id}" class="delete-button">Eliminar</button>
        </div>
      `;
      appointmentsList.appendChild(li);
    });
  };

  // Initial fetch of appointments
  fetchAppointments();

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

  // Handle delete button click
  appointmentsList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-button')) {
      const id = event.target.dataset.id;
      await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      fetchAppointments(); // Refresh the list
    }
  });

  // Handle edit button click
  appointmentsList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('edit-button')) {
      const id = event.target.dataset.id;
      const response = await fetch('/api/appointments');
      const appointments = await response.json();
      const appointmentToEdit = appointments.find(app => app.id === id);

      if (appointmentToEdit) {
        editIdInput.value = appointmentToEdit.id;
        editDateInput.value = new Date(appointmentToEdit.date).toISOString().slice(0, 16);
        editDescriptionInput.value = appointmentToEdit.description;
        editModal.style.display = 'block';
      }
    }
  });

  // Close modal
  closeButton.addEventListener('click', () => {
    editModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === editModal) {
      editModal.style.display = 'none';
    }
  });

  // Save edited appointment
  saveButton.addEventListener('click', async () => {
    const id = editIdInput.value;
    const date = editDateInput.value;
    const description = editDescriptionInput.value;

    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, description }),
    });
    editModal.style.display = 'none';
    fetchAppointments(); // Refresh the list
  });
});
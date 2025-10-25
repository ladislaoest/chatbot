export interface Appointment {
  id: string;
  date: Date;
  description: string;
}

const agenda = new Map<string, Appointment>();

export function addAppointment(date: Date, description: string): Appointment {
  const id = Date.now().toString();
  const newAppointment = { id, date, description };
  agenda.set(id, newAppointment);
  console.log("Cita añadida:", newAppointment);
  return newAppointment;
}

export function listAppointments(): Appointment[] {
  return Array.from(agenda.values());
}

export function deleteAppointment(id: string): boolean {
  return agenda.delete(id);
}

export function updateAppointment(id: string, newDate: Date, newDescription: string): Appointment | undefined {
  if (agenda.has(id)) {
    const updatedAppointment = { id, date: newDate, description: newDescription };
    agenda.set(id, updatedAppointment);
    return updatedAppointment;
  }
  return undefined;
}
export interface Appointment {
  date: Date;
  description: string;
}

const agenda: Appointment[] = [];

export function addAppointment(date: Date, description: string): Appointment {
  const newAppointment = { date, description };
  agenda.push(newAppointment);
  console.log("Cita añadida:", newAppointment);
  return newAppointment;
}

export function listAppointments(): Appointment[] {
  return agenda;
}

/**
 * Interfaz que representa una invención (creada por un personaje) en el universo de Rick and Morty.
 */
export interface Invention {
  id: string;
  name: string;
  inventorId: string;
  type: string; 
  nivelDanger: number; // Nivel de peligro de la invención, en una escala del 1 al 10
  description: string;
}
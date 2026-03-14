/**
 * Interfaz que representa una invención (creada por un personaje) en el universo de Rick and Morty.
 */
export interface Invention {
  id: number;
  name: string;
  inventorId: number; // Referencia al ID del inventor de la invención, NO SE SI ES ASI LO DE REFERENCIA
  tipo: string; 
  nivelDanger: number; // Nivel de peligro de la invención, en una escala del 1 al 10
  description: string;
}
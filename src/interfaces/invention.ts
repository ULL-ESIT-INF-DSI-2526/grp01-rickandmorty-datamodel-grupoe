/**
 * Interfaz que representa una invención (creada por un personaje) en el universo de Rick and Morty.
 */
export interface Invention {
  id: string; /** Id de la invención */
  name: string; /** Nombre de la invención */
  inventorId: string; /** Id del inventor */
  type: string; /** Tipo de la invención */
  nivelDanger: number; /** Nivel de peligro de la invención, en una escala del 1 al 10 */
  description: string; /** Descripción de la invención */
}

/**
 * Interfaz para representar un filtro de búsqueda de inventos.
 */
export interface FiltroInventos {
  name?: string;
  type?: string;
  inventorId?: string;
  nivelDanger?: number;
}

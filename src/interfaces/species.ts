/**
 * Interfaz que representa una especie en el universo de Rick and Morty.
 */
export interface Species {
  id: number;
  name: string;
  origin: string;
  type: string;
  expectancy: number; // Esperanza en años (no se si hay un tipo de años con date)
  description: string;
}
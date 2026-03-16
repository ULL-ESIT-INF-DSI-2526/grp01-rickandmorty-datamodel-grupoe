/**
 * Interfaz que representa una ubicación en el universo de Rick and Morty.
 */
export interface Location {
  id: string;
  name: string;
  type: string;
  dimensionId: string;
  population: number;
  description: string;
}
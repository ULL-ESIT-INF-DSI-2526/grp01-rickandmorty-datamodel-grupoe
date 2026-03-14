/**
 * Interfaz que representa una ubicación en el universo de Rick and Morty.
 */
export interface Location {
  id: number;
  name: string;
  dimensionId: string; // Referencia al ID de la dimensión a la que pertenece la ubicación, NO SE SI ES ASI LO DE REFERENCIA
  population: number;
  description: string;
}
/**
 * Interfaz que representa una ubicación en el universo de Rick and Morty.
 */
export interface Location {
  id: string; /** Id de la ubicación */
  name: string; /** Nombre de la ubicación */
  type: string; /** Tipo de la ubicación */
  dimensionId: string; /** Id de la dimensión a la que pertenece la ubicación */
  population: number; /** Población de la ubicación */
  description: string; /** Descripción de la ubicación */
}

/**
 * Interfaz para representar un filtro de búsqueda de localizaciones.
 */
export interface FiltroLocalizaciones {
  name?: string;
  type?: string;
  dimensionId?: string;
}

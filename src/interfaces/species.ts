/**
 * Interfaz que representa una especie en el universo de Rick and Morty.
 */
export interface Species {
  id: string; /** Id de la especie */
  name: string; /** Nombre de la especie */
  origin: string; /** Origen de la especie */
  type: string; /** Tipo de la especie */
  expectancy: number; /** Esperanza de vida en años */
  description: string; /** Descripción de la especie */
}

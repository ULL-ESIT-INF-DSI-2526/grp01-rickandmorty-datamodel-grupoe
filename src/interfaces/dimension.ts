/**
 * Tipo para representar el estado de una dimensión en el universo de Rick and Morty..
 */
export type stateDimension = "activa" | "destruida" | "cuarentena";

/**
 * Interfaz para representar una dimensión en el universo de Rick and Morty.
 */
export interface Dimension {
  id: string; /** Id de la dimensión */
  name: string; /** Nombre de la dimensión */
  state: stateDimension; /** Estado de la dimensión */
  nivelTecnolog: number; /** Nivel de tecnología de la dimensión */
  description: string; /** Descripción de la dimensión */
}

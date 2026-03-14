/**
 * Tipo para representar el estado de una dimensión en el universo de Rick and Morty..
 */
export type stateDimension = "activa" | "destruida" | "cuarentena";

/**
 * Interfaz para representar una dimensión en el universo de Rick and Morty.
 */
export interface Dimension {
  id: string;
  name: string;
  state: stateDimension;
  nivelTecnolog: number;
  description: string;
}
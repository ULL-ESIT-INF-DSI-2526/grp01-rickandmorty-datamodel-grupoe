import { Character } from "./character.js";
import { Dimension } from "./dimension.js";

/**
 * Interfaz para representar un viaje entre dimensiones.
 */
export interface Travel {
  id: string; /** Id del viaje */
  origin: Dimension; /** Dimensión de origen */
  destination: Dimension; /** Dimensión de destino */
  traveler: Character; /** Personaje que realiza el viaje */
  date: Date; /** Fecha del viaje */
  motive: string; /** Motivo del viaje */
}

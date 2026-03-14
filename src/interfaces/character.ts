/**
 * Tipo para representar el estado de un personaje en el universo de Rick and Morty.
 * Recordar que los personajes pueden tener distintas versiones de si mismo.
 */
export type stateCharacter = "vivo" | "muerto" | "desconocido" | "robot";

/**
 * Interfaz para representar un personaje en el universo de Rick and Morty.
 */
export interface Character {
  id: string;
  name: string;
  speciesId: string; // Referencia al ID de la especie del personaje, NO SE SI ES ASI LO DE REFERENCIA
  dimensionId: string; // Referencia al ID de la dimensión a la que pertenece el personaje, NO SE SI ES ASI LO DE REFERENCIA
  state: stateCharacter;
  affiliation: string;
  nivelIntelligence: number;
  description: string;
}
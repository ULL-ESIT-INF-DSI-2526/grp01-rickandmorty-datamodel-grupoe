/**
 * Tipo para representar el estado de un personaje en el universo de Rick and Morty.
 * Recordar que los personajes pueden tener distintas versiones de si mismo.
 */
export type stateCharacter = "vivo" | "muerto" | "desconocido" | "robot";

/**
 * Interfaz para representar un personaje en el universo de Rick and Morty.
 */
export interface Character {
  id: string; /** Id del personaje */
  name: string; /** Nombre del personaje */
  speciesId: string; /** Id de la especie del personaje */
  dimensionId: string; /** Id de la dimensión a la que pertenece el personaje */
  state: stateCharacter; /** Estado del personaje (vivo, muerto, desconocido, robot) */
  affiliation: string; /** Afiliación del personaje */
  nivelIntelligence: number; /** Nivel de inteligencia del personaje */
  description: string; /** Descripción del personaje */
}

/**
 * Interfaz para representar un filtro de búsqueda de personajes.
 * Permite filtrar por nombre, especie, dimensión, estado o afiliación.
 */
export interface FiltroPersonajes {
  name?: string;
  speciesId?: string;
  dimensionId?: string;
  state?: string;
  affiliation?: string;
}

/**
 * Interfaz para representar el ordenamiento de personajes.
 * Permite ordenar por cualquier campo de Character en orden ascendente o descendente.
 */
export interface OrdenPersonajes {
  campo: "name" | "nivelIntelligence";
  direccion: "asc" | "desc";
}

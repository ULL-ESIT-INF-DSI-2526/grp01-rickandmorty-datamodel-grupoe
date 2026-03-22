/**
 * Interfaz que representa un evento en el sistema de viajes interdimensionales.
 */
export interface Evento {
  id: string; /** ID único del evento */
  personajeId?: string; /** ID del personaje involucrado en el evento */
  dimensionOrigenId?: string; /** ID de la dimensión de origen */
  dimensionDestinoId?: string; /** ID de la dimensión de destino */
  artefactoId?: string;       /** ID del artefacto involucrado */
  localizacionId?: string;    /** ID de la localización donde ocurre el evento */
}
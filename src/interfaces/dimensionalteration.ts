/**
 * Interfaz para representar una alteración en la estructura de una dimensión.
 */
export interface AlteracionDimension {
  id: string; /** Id de la alteración */
  tipo: 'creacion' | 'destruccion'; /** Tipo de alteración */
  causa: 'experimento' | 'paradoja'; /** Causa de la alteración */
  dimensionId: string; /** Id de la dimensión afectada */
  fecha: string; /** Fecha de la alteración */
  descripcion: string; /** Descripción de la alteración */
}
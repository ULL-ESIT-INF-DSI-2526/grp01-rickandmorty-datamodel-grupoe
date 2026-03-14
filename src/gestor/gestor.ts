import { Character } from '../interfaces/character.js';
import { Dimension } from '../interfaces/dimension.js';

/**
 * Clase con el gestor central del Multiverso.
 * Se encarga de validar reglas de negocio, mantener la coherencia
 * y gestionar las entidades (Dimensiones, Personajes, etc.).
 */
export class GestorMultiverso {
  // Para las primeras pruebas usaremos vectroes en memoria, esto lo cambiaremos por bases de datos (los lowdb) en el futuro
  private dimensiones: Dimension[] = [];
  private personajes: Character[] = [];

  /**
   * Función para agregar una nueva dimensión al multiverso, con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param dimension - La dimensión a agregar
   */
  public agregarDimension(dimension: Dimension): void {
    if (dimension.nivelTecnolog < 1 || dimension.nivelTecnolog > 10) {
      throw new Error(`El nivel tecnológico debe estar entre 1 y 10. Valor recibido: ${dimension.nivelTecnolog}`);
    }
    const existe = this.dimensiones.find(d => d.id === dimension.id);
    if (existe) {
      throw new Error(`Ya existe una dimensión con el ID ${dimension.id}`);
    }
    this.dimensiones.push(dimension);
  }

  /**
   * Funcion para obtener las dimensiones del multiverso
   */
  public obtenerDimensiones(): Dimension[] {
    return this.dimensiones;
  }

  /**
   * Función para agregar un nuevo personaje al multiverso, con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param personaje - Personaje a añadir
   */
  public agregarPersonaje(personaje: Character): void {
    // Validación de existencia de la dimensión de origen del personaje
    const dimensionOrigen = this.dimensiones.find(d => d.id === personaje.dimensionId);
    if (!dimensionOrigen) {
      throw new Error(`La dimensión de origen ${personaje.dimensionId} no existe en el multiverso.`);
    }
    // Validación de inteligencia (escala del 1 al 10)
    if (personaje.nivelIntelligence < 1 || personaje.nivelIntelligence > 10) {
      throw new Error('El nivel de inteligencia debe estar entre 1 y 10.');
    }
    this.personajes.push(personaje);
  }

  /**
   * Función para obtener la lista de personajes registrados en el multiverso.
   */
  public obtenerPersonajes(): Character[] {
    return this.personajes;
  }
}
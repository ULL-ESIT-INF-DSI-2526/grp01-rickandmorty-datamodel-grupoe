import { Character } from '../interfaces/character.js';
import { Dimension } from '../interfaces/dimension.js';
import { db } from '../database/db.js';

/**
 * Clase con el gestor central del Multiverso.
 * Se encarga de validar reglas de negocio, mantener la coherencia
 * y gestionar las entidades (Dimensiones, Personajes, etc.).
 */
export class GestorMultiverso {
  /**
   * Función para agregar una nueva dimensión al multiverso (base de datos), con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param dimension - La dimensión a agregar
   */
  public async agregarDimension(dimension: Dimension): Promise<void> {
    if (dimension.nivelTecnolog < 1 || dimension.nivelTecnolog > 10) {
      throw new Error(`El nivel tecnológico debe estar entre 1 y 10. Valor recibido: ${dimension.nivelTecnolog}`);
    }
    const existe = db.data.dimensiones.find(d => d.id === dimension.id);
    if (existe) {
      throw new Error(`Ya existe una dimensión con el ID ${dimension.id}`);
    }
    await db.update(( { dimensiones }) => {
      dimensiones.push(dimension);
    });
  }

  /**
   * Funcion para obtener las dimensiones del multiverso a través de la base de datos
   */
  public obtenerDimensiones(): Dimension[] {
    return db.data.dimensiones;
  }

  /**
   * Función para agregar un nuevo personaje al multiverso, con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param personaje - Personaje a añadir
   */
  public async agregarPersonaje(personaje: Character): Promise<void> {
    // Validación de existencia de la dimensión de origen del personaje
    const dimensionOrigen = db.data.dimensiones.find(d => d.id === personaje.dimensionId);
    if (!dimensionOrigen) {
      throw new Error(`La dimensión de origen ${personaje.dimensionId} no existe en el multiverso.`);
    }
    // Validación de inteligencia (escala del 1 al 10)
    if (personaje.nivelIntelligence < 1 || personaje.nivelIntelligence > 10) {
      throw new Error('El nivel de inteligencia debe estar entre 1 y 10.');
    }
    
    await db.update(( { personajes }) => {
      personajes.push(personaje);
    });
  }

  /**
   * Función para obtener la lista de personajes registrados en el multiverso.
   */
  public obtenerPersonajes(): Character[] {
    return db.data.personajes;
  }
}
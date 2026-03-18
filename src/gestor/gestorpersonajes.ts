import { Character } from '../interfaces/character.js';
import { Low } from 'lowdb';

import { Data } from '../database/db.js';

export class GestorPersonajes {
  private db: Low<Data>; // Referencia a la base de datos

  // Constructor que recibe la base de datos desde fuera (desde nuestro db.js)
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  // TODA LA CONFIGURACION DE LOS PERSONAJES

  /**
   * Función para agregar un nuevo personaje al multiverso, con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param personaje - Personaje a añadir
   */
  public async agregarPersonaje(personaje: Character): Promise<void> {
    // Validación de existencia de la dimensión de origen del personaje
    const dimensionOrigen = this.db.data.dimensiones.find(d => d.id === personaje.dimensionId);
    if (!dimensionOrigen) {
      throw new Error(`La dimensión de origen ${personaje.dimensionId} no existe en el multiverso.`);
    }
    // Validación de inteligencia (escala del 1 al 10)
    if (personaje.nivelIntelligence < 1 || personaje.nivelIntelligence > 10) {
      throw new Error('El nivel de inteligencia debe estar entre 1 y 10.');
    }
    
    await this.db.update(( { personajes }) => {
      personajes.push(personaje);
    });
  }

  /**
   * Funcion para eliminar un personaje del multiverso dado su id
   * @param id - ID del personaje a eliminar
   */
  public async eliminarPersonaje(id: string): Promise<void> {
    const index = this.db.data.personajes.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`No existe un personaje con el ID ${id}`);
    }
    await this.db.update(( { personajes }) => {
      personajes.splice(index, 1);
    });
  }

  /**
   * Función para obtener la lista de personajes registrados en el multiverso.
   */
  public obtenerPersonajes(): Character[] {
    return this.db.data.personajes;
  }
}
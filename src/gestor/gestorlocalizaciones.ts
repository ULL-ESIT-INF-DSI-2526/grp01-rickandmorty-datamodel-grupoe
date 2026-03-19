import { Location } from '../interfaces/location.js';
import { Low } from 'lowdb';

import { Data } from '../database/db.js';

export class GestorLocalizaciones {
  private db: Low<Data>; // Referencia a la base de datos

  // Constructor que recibe la base de datos desde fuera (desde nuestro db.js)
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  // TODA LA CONFIGURACION DE LAS ESPECIES

  /**
   * Función para agregar una nueva localizacion al multiverso (base de datos), con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param dimension - La localización a agregar
   */
  public async agregarLocalizacion(localizacion: Location): Promise<void> {
    const existe = this.db.data.ubicaciones.find(l => l.id === localizacion.id);
    if (existe) {
      throw new Error(`Ya existe una localización con el ID ${localizacion.id}`);
    }
    const dimensionValida = this.db.data.dimensiones.find(d => d.id === localizacion.dimensionId);
    if (!dimensionValida) {
      throw new Error(`La dimensión de origen ${localizacion.dimensionId} no existe en el multiverso.`);
    }
    await this.db.update(( { ubicaciones }) => {
      ubicaciones.push(localizacion);
    });
  }

  /**
   * Funcion para eliminar una localización del multiverso a través de la base de datos
   * @param id - ID de la localización a eliminar
   */
  public async eliminarLocalizacion(id: string): Promise<void> {
    const index = this.db.data.ubicaciones.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error(`No existe una localización con el ID ${id}`);
    }
    await this.db.update(( { ubicaciones }) => {
      ubicaciones.splice(index, 1);
    });
  }

  /**
   * Función para obtener la lista de dimensiones registradas en el multiverso. 
   */
  public obtenerLocalizaciones(): Location[] {
    return this.db.data.ubicaciones;  
  }

}
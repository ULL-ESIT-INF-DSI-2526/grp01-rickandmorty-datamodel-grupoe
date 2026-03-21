
import { Invention } from '../interfaces/invention.js';
import { Low } from 'lowdb';

import { Data } from '../database/db.js';

export class GestorInventos {
  private db: Low<Data>; // Referencia a la base de datos

  // Constructor que recibe la base de datos desde fuera (desde nuestro db.js)
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  // TODA LA CONFIGURACION DE LOS INVENTOS

  /**
   * Función para agregar una nueva dimensión al multiverso (base de datos), con las comprobaciones necesarias para mantener la coherencia del sistema.
   * @param dimension - La dimensión a agregar
   */
  public async agregarInvento(invention: Invention): Promise<void> {
    const existe = this.db.data.invenciones.find(i => i.id === invention.id);
    if (existe) {
      throw new Error(`Ya existe un invento con el ID ${invention.id}`);
    }
    // Comprobamos que el inventor existe en la base de datos
    const inventorExiste = this.db.data.personajes.some(p => p.id === invention.inventorId);
    if (!inventorExiste) {
      throw new Error(`El inventor con ID ${invention.inventorId} no existe en el multiverso.`);
    }
    await this.db.update(( { invenciones }) => {
      invenciones.push(invention);
    });
  }

  /**
   * Funcion para eliminar un invento del multiverso a través de la base de datos
   * @param id - ID del invento a eliminar
   */
  public async eliminarInvento(id: string): Promise<void> {
    const index = this.db.data.invenciones.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error(`No existe un invento con el ID ${id}`);
    }
    await this.db.update(( { invenciones }) => {
      invenciones.splice(index, 1);
    });
  }

  /**
   * Función para obtener la lista de dimensiones registradas en el multiverso. 
   */
  public obtenerInventos(): Invention[] {
    return this.db.data.invenciones;  
  }

  public async modificarInvento(id: string, nuevosDatos: Partial<Invention>): Promise<void> {
    const invent = this.db.data.invenciones.findIndex(i => i.id === id);
    if (invent === -1) {
      throw new Error(`No existe un invento con el ID ${id}`);
    }
    await this.db.update(( { invenciones }) => {
      invenciones[invent] = { ...invenciones[invent], ...nuevosDatos };
    });
  }

  public async consultarInventos(filtro?: Partial<Invention>): Promise<Invention[]> {
    let resultados = this.db.data.invenciones;

    if (filtro) {
      resultados = resultados.filter(i => {
        let coincide = true;
        if (filtro.name && !i.name.toLowerCase().includes(filtro.name.toLowerCase())) {
          coincide = false;
        }
        if (filtro.type && i.type?.toLowerCase() !== filtro.type.toLowerCase()) {
          coincide = false;
        }
        if (filtro.inventorId && i.inventorId !== filtro.inventorId) {
          coincide = false;
        }
        if (filtro.nivelDanger && i.nivelDanger !== filtro.nivelDanger) {
          coincide = false;
        }
        return coincide;
      });
    }
    return resultados;
  }
}

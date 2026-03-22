import { Species } from "../interfaces/species.js";
import { Low } from "lowdb";

import { Data } from "../database/db.js";

export class GestorEspecies {
  private db: Low<Data>;

  //* Constructor que recibe la base de datos desde fuera (desde nuestro db.js) */
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  /**
   * Función para agregar una nueva especie al multiverso (base de datos)
   * @param especie - La especie a agregar
   */
  public async agregarEspecie(especie: Species): Promise<void> {
    const existe = this.db.data.especies.find((e) => e.id === especie.id);
    if (existe) {
      throw new Error(`Ya existe una especie con el ID ${especie.id}`);
    }
    await this.db.update(({ especies }) => {
      especies.push(especie);
    });
  }

  /**
   * Funcion para eliminar una especie del multiverso a través de la base de datos
   * @param id - ID de la especie a eliminar
   */
  public async eliminarEspecie(id: string): Promise<void> {
    const index = this.db.data.especies.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`No existe una especie con el ID ${id}`);
    }
    await this.db.update(({ especies }) => {
      especies.splice(index, 1);
    });
  }

  /**
   * Función para obtener la lista de especies registradas en el multiverso.
   */
  public obtenerEspecies(): Species[] {
    return this.db.data.especies;
  }

  /**
   * Función para modificar una especie existente por ID.
   */
  public async modificarEspecie(
    id: string,
    datosActualizados: Partial<Species>,
  ): Promise<void> {
    const index = this.db.data.especies.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`No existe una especie con el ID ${id}`);
    }
    await this.db.update(({ especies }) => {
      especies[index] = { ...especies[index], ...datosActualizados };
    });
  }
}

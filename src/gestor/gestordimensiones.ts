import { Dimension } from "../interfaces/dimension.js";
import { Low } from "lowdb";

import { Data } from "../database/db.js";

/**
 * Clase encargada de gestionar las dimensiones en el multiverso.
 */
export class GestorDimensiones {
  private db: Low<Data>;

/**
 * Constructor del gestor de dimensiones
 * @param baseDatos - Referencia a la base de datos (Low<Data>)
 */
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  /**
   * Función para agregar una nueva dimensión al multiverso (base de datos)
   * @param dimension - La dimensión a agregar
   */
  public async agregarDimension(dimension: Dimension): Promise<void> {
    if (dimension.nivelTecnolog < 1 || dimension.nivelTecnolog > 10) {
      throw new Error(
        `El nivel tecnológico debe estar entre 1 y 10. Valor recibido: ${dimension.nivelTecnolog}`,
      );
    }
    const existe = this.db.data.dimensiones.find((d) => d.id === dimension.id);
    if (existe) {
      throw new Error(`Ya existe una dimensión con el ID ${dimension.id}`);
    }
    await this.db.update(({ dimensiones }) => {
      dimensiones.push(dimension);
    });
  }

  /**
   * Funcion para eliminar una dimension del multiverso a través de la base de datos
   * @param id - ID de la dimensión a eliminar
   */
  public async eliminarDimension(id: string): Promise<void> {
    const index = this.db.data.dimensiones.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`No existe una dimensión con el ID ${id}`);
    }
    await this.db.update(({ dimensiones }) => {
      dimensiones.splice(index, 1);
    });
  }

  /**
   * Función para obtener la lista de dimensiones registradas en el multiverso.
   */
  public obtenerDimensiones(): Dimension[] {
    return this.db.data.dimensiones;
  }

  /**
   * Función para modificar una dimensión existente por ID.
   */
  public async modificarDimension(
    id: string,
    datosActualizados: Partial<Dimension>,
  ): Promise<void> {
    const index = this.db.data.dimensiones.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`No existe una dimensión con el ID ${id}`);
    }
    if (
      datosActualizados.nivelTecnolog &&
      (datosActualizados.nivelTecnolog < 1 ||
        datosActualizados.nivelTecnolog > 10)
    ) {
      throw new Error(
        `El nivel tecnológico debe estar entre 1 y 10. Valor recibido: ${datosActualizados.nivelTecnolog}`,
      );
    }
    await this.db.update(({ dimensiones }) => {
      dimensiones[index] = { ...dimensiones[index], ...datosActualizados };
    });
  }
}

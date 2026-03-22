
import { Low } from "lowdb";
import { Data } from "../database/db.js";
import { Dimension } from "../interfaces/dimension.js";

export class GestorInformes {
  private db: Low<Data>;

  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  /**
   * Función para listar dimensiones activas con su nivel tecnológico medio.
   * @returns - Un array de strings con la información de las dimensiones activas y el nivel tecnológico medio.
   */
  public listarDimensionesActivas(): { dimensiones: Dimension[], media: number } {
      const activas = this.db.data.dimensiones.filter((d) => d.state === 'activa');
      
      let sumaNiveles = 0;
      activas.forEach((d) => { sumaNiveles += d.nivelTecnolog; });
      const nivelMedio = activas.length > 0 ? (sumaNiveles / activas.length) : 0;

      return { 
        dimensiones: activas, 
        media: nivelMedio 
      };
    }
  }
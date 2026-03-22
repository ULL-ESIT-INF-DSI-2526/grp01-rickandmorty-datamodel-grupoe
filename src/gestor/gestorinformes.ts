
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
  

  /**
   * Funcion para informe de personajes con mayor número de versiones alternativas.
   * @returns - Un array de objetos con el nombre base y la cantidad de versiones alternativas
   */
  public informeVersionesAlternativas(): { nombreBase: string, cantidad: number }[] {
    const personajes = this.db.data.personajes;
    const conteo: Record<string, number> = {};

    // Agrupamos por el nombre comun como haciamos en el gestor de personajes y contamos las apariciones
    personajes.forEach((p) => {
      const nombreBase = p.name.toLowerCase().trim().split(" ")[0];
      conteo[nombreBase] = (conteo[nombreBase] || 0) + 1;
    });

    // Para convertirlo en un array de arrays y poder ordenarlos
    const ranking = Object.entries(conteo)
      .map(([nombreBase, cantidad]) => ({
        nombreBase,
        cantidad,
      }))
      // Filtramos los que tienen más de 1 aparición
      .filter((v) => v.cantidad > 1)
      // 4. Ordenamos de mayor a menor cantidad
      .sort((a, b) => b.cantidad - a.cantidad);
    return ranking;
  }
}
import { Low } from 'lowdb';
import { Data } from '../database/db.js';
import { Dimension } from '../interfaces/dimension.js';
import { AlteracionDimension } from '../interfaces/dimensionalteration.js';

export class GestorAlteracionesDimensionales {
  private db: Low<Data>;

  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  public async registrarAlteracion(alteracion: AlteracionDimension, nuevaDimension?: Dimension): Promise<void> {
    await this.db.update((data) => {
      if (!data.alteracionesDimensionales) data.alteracionesDimensionales = [];
      data.alteracionesDimensionales.push(alteracion);
    });

    if (alteracion.tipo === 'creacion') {
      if (!nuevaDimension) {
        throw new Error('Se requieren los datos de la nueva dimensión para crearla.');
      }
      
      const existe = this.db.data.dimensiones.find(d => d.id === nuevaDimension.id);
      if (existe) {
        throw new Error(`La dimensión con ID ${nuevaDimension.id} ya existe.`);
      }

      await this.db.update(({ dimensiones }) => {
        dimensiones.push(nuevaDimension);
      });

    } else if (alteracion.tipo === 'destruccion') {
      const indexDim = this.db.data.dimensiones.findIndex(d => d.id === alteracion.dimensionId);
      if (indexDim === -1) {
        throw new Error(`La dimensión con ID ${alteracion.dimensionId} no existe en el multiverso.`);
      }

      await this.db.update(({ dimensiones, personajes }) => {
        dimensiones[indexDim].state = 'destruida';

        personajes.forEach(p => {
          if (p.dimensionId === alteracion.dimensionId && p.state !== 'muerto') {
            p.state = 'desconocido';
          }
        });
      });
    }
  }
}
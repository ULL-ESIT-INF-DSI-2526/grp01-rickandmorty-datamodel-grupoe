import { Travel } from "../interfaces/travels.js";
import { Low } from "lowdb";
import { Data } from "../database/db.js";

export class GestorViajes {
  private db: Low<Data>;

  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  public async agregarViaje(viaje: Travel): Promise<void> {
    const dimensionOrigen = this.db.data.dimensiones.find(
      (d) => d.id === viaje.origin.id,
    );
    const dimensionDestino = this.db.data.dimensiones.find(
      (d) => d.id === viaje.destination.id,
    );
    const viajero = this.db.data.personajes.find(
      (p) => p.id === viaje.traveler.id,
    );

    if (!dimensionOrigen) {
      throw new Error(
        `La dimensión de origen ${viaje.origin.id} no existe en el multiverso.`,
      );
    }
    if (!dimensionDestino) {
      throw new Error(
        `La dimensión de destino ${viaje.destination.id} no existe en el multiverso.`,
      );
    }
    if (!viajero) {
      throw new Error(
        `El viajero con ID ${viaje.traveler.id} no existe en el multiverso.`,
      );
    }

    await this.db.update(({ viajes }) => {
      viajes.push(viaje);
    });
  }

  public async eliminarViaje(id: string): Promise<void> {
    const index = this.db.data.viajes.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new Error(`No existe un viaje con el ID ${id}`);
    }
    await this.db.update(({ viajes }) => {
      viajes.splice(index, 1);
    });
  }

  public obtenerViajes(): Travel[] {
    return this.db.data.viajes;
  }

  public obtenerHistorialViajesPorViajero(travelerId: string): string[] {
    const viajero = this.db.data.viajes.filter((v) => v.traveler.id === travelerId);
    if (viajero.length === 0) {
      console.log(`No se encontraron viajes para el viajero con ID ${travelerId}.`);
      return [];
    }
    let informe: string[] = [];
    viajero.forEach((viaje) => {
      informe.push(`Viaje ID: ${viaje.id} Origen: ${viaje.origin.name} (ID: ${viaje.origin.id}) Destino: ${viaje.destination.name} (ID: ${viaje.destination.id}) Fecha: ${viaje.date.toString().split("T")[0]} Motivo: ${viaje.motive}\n\n`);
    });

    const tabla = viajero.map((v) => ({
      "Viaje ID": v.id,
      "Origen": `${v.origin.name} (ID: ${v.origin.id})`,
      "Destino": `${v.destination.name} (ID: ${v.destination.id})`,
      "Fecha": v.date.toString().split("T")[0],
      "Motivo": v.motive,
    }));
    console.table(tabla);
    
    return informe;
  }
}

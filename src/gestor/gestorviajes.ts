import { Travel } from "../interfaces/travels.js";
import { Low } from "lowdb";
import { Data } from "../database/db.js";

/**
 * Clase encargada de gestionar los viajes interdimensionales en el multiverso.
 */
export class GestorViajes {
  private db: Low<Data>;

  /**
   * Constructor del gestor de viajes
   * @param baseDatos - Referencia a la base de datos (Low<Data>)
   */
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  /**
   * Añade un nuevo viaje interdimensional al multiverso
   * @param viaje - El viaje a agregar, con dimensiones de origen y destino, viajero, fecha y motivo.
   * @throws - Error si las dimensiones de origen o destino no existen, o si el viajero no existe en el multiverso.
   */
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

  /**
   * Borra un viaje interdimensional del multiverso dado su ID.
   * @param id - ID del viaje a eliminar
   * @throws - Error si no existe un viaje con el ID proporcionado.
   */
  public async eliminarViaje(id: string): Promise<void> {
    const index = this.db.data.viajes.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new Error(`No existe un viaje con el ID ${id}`);
    }
    await this.db.update(({ viajes }) => {
      viajes.splice(index, 1);
    });
  }

  /**
   * Obtiene la lista de viajes interdimensionales
   * @returns - Lista de viajes registrados en el multiverso.
   */
  public obtenerViajes(): Travel[] {
    return this.db.data.viajes;
  }

  /**
   * Consigue el historial de viajes realizados por un viajero específico.
   * @param travelerId - ID del viajero
   * @returns - Lista de viajes realizados por el viajero
   */
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

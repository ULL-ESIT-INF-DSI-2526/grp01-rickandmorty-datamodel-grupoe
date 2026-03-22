import { Evento } from "../interfaces/event.js";
import { Low } from "lowdb";

import { Data } from "../database/db.js";

export class GestorEventos {
  private db: Low<Data>;

  //* Constructor que recibe la base de datos desde fuera (desde nuestro db.js) */
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
  }

  /**
   * Registra el despliegue de un artefacto en una localización concreta.
   * @param artefactoId - ID del invento 
   * @param localizacionId - ID del lugar
   */
  public async desplegarArtefacto(artefactoId: string, localizacionId: string): Promise<void> {
    const invento = this.db.data.invenciones.find(i => i.id === artefactoId);
    if (!invento) {
      throw new Error(`No se puede desplegar: El artefacto con ID ${artefactoId} no existe.`);
    }

    const localizacion = this.db.data.ubicaciones.find(l => l.id === localizacionId);
    if (!localizacion) {
      throw new Error(`No se puede desplegar: La localización con ID ${localizacionId} no existe.`);
    }

    // Creamos el objeto del evento
    const nuevoEvento: Evento = {
      id: `EV-${Date.now()}`, // Generamos un ID único rápido
      artefactoId: invento.id,
      localizacionId: localizacion.id,
    };

    // Guardamos en la base de datos 
    await this.db.update((data) => {
      if (!data.eventos) data.eventos = []; 
      data.eventos.push(nuevoEvento);
    });
  }

  /**
   * Consulta los eventos registrados.
   * @returns Un array de eventos registrados.
   */
  public consultarEventos(): Evento[] {
    return this.db.data.eventos || [];
  }

  /**
   * Elimina un evento por su ID.
   * @param eventoId - ID del evento a eliminar.
   */
  public async eliminarEvento(eventoId: string): Promise<void> {
    await this.db.update((data) => {
      if (!data.eventos) return; 
      const index = data.eventos.findIndex(e => e.id === eventoId);
      if (index !== -1) {
        data.eventos.splice(index, 1); 
      }
    });
  }
}
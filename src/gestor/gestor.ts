import { GestorDimensiones } from './gestordimensiones.js';
import { GestorPersonajes } from './gestorpersonajes.js';
// import { GestorEspecies } from './gestorespecies.js';
// import { GestorLocalizaciones } from './gestorlocalizaciones.js'
// import { GestorInventos } from './gestorinventos.js'
import { Low } from 'lowdb';

import { Data } from '../database/db.js';

/**
 * Clase con el gestor central del Multiverso.
 * Se encarga de validar reglas de negocio, mantener la coherencia
 * y gestionar las entidades (Dimensiones, Personajes, etc.).
 */
export class GestorMultiverso {
  public dimensiones: GestorDimensiones;
  public personajes: GestorPersonajes;
  //public especies: GestorEspecies;
  //public localizaciones: GestorLocalizaciones;
  //public inventos: GestorInventos;

  private db: Low<Data>; // Referencia a la base de datos

  // Constructor que recibe la base de datos desde fuera (desde nuestro db.js)
  constructor(baseDatos: Low<Data>) {
    this.db = baseDatos;
    this.dimensiones = new GestorDimensiones(baseDatos);
    this.personajes = new GestorPersonajes(baseDatos);
    //this.especies = new GestorEspecies(baseDatos);
    //this.localizaciones = new GestorLocalizaciones(baseDatos);
    //this.inventos = new GestorInventos(baseDatos);
  }

}
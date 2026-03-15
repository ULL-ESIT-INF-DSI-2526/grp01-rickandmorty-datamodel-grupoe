import { JSONFilePreset } from 'lowdb/node'
import { Low } from 'lowdb';

// Esto debe acabar en .js
import { Character } from '../interfaces/character.js';
import { Dimension } from '../interfaces/dimension.js';
import { Invention } from '../interfaces/invention.js';
import { Species } from '../interfaces/species.js';
import { Location } from '../interfaces/location.js';


/**
 * Interfaz que define la estructura de la base de datos.
 */
export interface Data {
  dimensiones: Dimension[];
  personajes: Character[];
  invenciones: Invention[];
  especies: Species[];
  ubicaciones: Location[];
}

/**
 * Estructura por defecto de la base de datos.
 */
const defaultData: Data = {
    dimensiones: [],
    personajes: [],
    invenciones: [],
    especies: [],
    ubicaciones: []
};

/**
 * Inicializa la base de datos utilizando lowdb con un archivo JSON.
 */
export const db: Low<Data> = await JSONFilePreset<Data>('src/database/db.json', defaultData);
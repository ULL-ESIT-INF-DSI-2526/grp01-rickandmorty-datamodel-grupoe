import { describe, it, expect, beforeEach } from 'vitest';
import { Data } from '../../src/database/db.js'; 
import { Low } from 'lowdb';
import { GestorPersonajes } from '../../src/gestor/gestorpersonajes.js';
import { JSONFilePreset } from 'lowdb/node'
import { Character } from '../../src/interfaces/character.js';

describe('GestorPersonajes - Pruebas Unitarias', () => {
  let gestor: GestorPersonajes;
  beforeEach(async () => {
    // Vamos a usar una base de datos de prueba para no tocar la real 
    let dbTest: Low<Data> = await JSONFilePreset<Data>('src/database/test-db.json', {
      dimensiones: [],
      personajes: [],
      especies: [],
      ubicaciones: [],
      invenciones: []
    });

    // Limipiamos la sección de personajes para empezar cada test con una base de datos limpia
    dbTest.data.personajes = [];
    
    // Añadimos una dimensión de prueba para que los personajes puedan referenciarla sin problemas
    dbTest.data.dimensiones = [
      { id: 'C-137', name: 'Tierra', state: 'activa', nivelTecnolog: 10, description: '...' }
    ];
    await dbTest.write();

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorPersonajes(dbTest);
  });


  it ('debería agregar un personaje correctamente', async () => {
    expect(gestor.obtenerPersonajes()).toHaveLength(0); 
    const nuevoPersonaje: Character = { id: 'P-1', name: 'Rick' ,speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 10, description: '...' };

    await gestor.agregarPersonaje(nuevoPersonaje);
    expect(gestor.obtenerPersonajes()).toHaveLength(1); 
  });

  it ('debería lanzar un error al agregar un personaje con dimensión inexistente', async () => {
    const personajeInvalido: Character = { id: 'P-2', name: 'Morty', speciesId: 'sp-1', dimensionId: 'C-999', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 5, description: '...' };

    await expect(gestor.agregarPersonaje(personajeInvalido)).rejects.toThrow('La dimensión de origen C-999 no existe en el multiverso.');
  });

  it ('debería lanzar un error al agregar un personaje con nivel de inteligencia fuera de 1-10', async () => {
    const personajeInvalido: Character = { id: 'P-3', name: 'Summer', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 15, description: '...' };

    await expect(gestor.agregarPersonaje(personajeInvalido)).rejects.toThrow('El nivel de inteligencia debe estar entre 1 y 10.');
  });

  it ('debería eliminar un personaje correctamente', async () => {
    const personaje: Character = { id: 'P-3', name: 'Smith', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 7, description: '...' };

    await gestor.agregarPersonaje(personaje);
    expect(gestor.obtenerPersonajes()).toHaveLength(1); 
    await gestor.eliminarPersonaje('P-3');
    expect(gestor.obtenerPersonajes()).toHaveLength(0); 
  });

  it ('debería lanzar un error al eliminar un personaje inexistente', async () => {
    await expect(gestor.eliminarPersonaje('P-999')).rejects.toThrow('No existe un personaje con el ID P-999');
  });

  it ('debería retornar la lista de personajes correctamente', async () => {
    const personaje1: Character = { id: 'P-1', name: 'Rick' ,speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 10, description: '...' };
    const personaje2: Character = { id: 'P-2', name: 'Morty', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 5, description: '...' };

    await gestor.agregarPersonaje(personaje1);
    await gestor.agregarPersonaje(personaje2);
    
    const personajes = gestor.obtenerPersonajes();
    expect(personajes).toHaveLength(2);
    expect(personajes).include(personaje1);
    expect(personajes).include(personaje2);
  });


});
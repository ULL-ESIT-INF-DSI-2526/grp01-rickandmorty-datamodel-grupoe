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
    // Añadimos las dimensiones necesarias para que pasen las validaciones de los tests
    dbTest.data.dimensiones = [
      { id: 'C-137', name: 'Tierra', state: 'activa', nivelTecnolog: 10, description: '...' },
      { id: 'Z-Alpha', name: 'Ciudadela', state: 'activa', nivelTecnolog: 10, description: '...' },
      { id: 'J19', name: 'Dimensión Doofus', state: 'activa', nivelTecnolog: 6, description: '...' }
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

  it ('debería modificar los campos de un personaje correctamente', async () => {
    const personaje: Character = { id: 'P-1', name: 'Rick', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 10, description: 'Original' };
    await gestor.agregarPersonaje(personaje);

    await gestor.modificarPersonaje('P-1', { 
      name: 'Rick Pepinillo', 
      nivelIntelligence: 9 
    });

    const personajes = gestor.obtenerPersonajes();
    const personajeModificado = personajes.find(p => p.id === 'P-1');

    expect(personajeModificado?.name).toBe('Rick Pepinillo');
    expect(personajeModificado?.nivelIntelligence).toBe(9);
    expect(personajeModificado?.state).toBe('vivo');
    expect(personajeModificado?.dimensionId).toBe('C-137');
  });

  it ('debería lanzar un error al intentar modificar un personaje que no existe', async () => {
    await expect(
      gestor.modificarPersonaje('P-INVENTADO', { name: 'Morty Malvado' })
    ).rejects.toThrow('No existe un personaje con el ID P-INVENTADO');
  });

  it ('debería lanzar un error al modificar un personaje asignándole una dimensión inexistente', async () => {
    const personaje: Character = { id: 'P-1', name: 'Rick', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 10, description: '...' };
    await gestor.agregarPersonaje(personaje);

    await expect(
      gestor.modificarPersonaje('P-1', { dimensionId: 'DIMENSION_FALSA' })
    ).rejects.toThrow('La dimensión de origen DIMENSION_FALSA no existe en el multiverso.');
  });

  it ('debería lanzar un error al modificar un personaje asignándole una inteligencia fuera del rango 1-10', async () => {
    const personaje: Character = { id: 'P-1', name: 'Rick', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 10, description: '...' };
    await gestor.agregarPersonaje(personaje);

    await expect(
      gestor.modificarPersonaje('P-1', { nivelIntelligence: 15 })
    ).rejects.toThrow('El nivel de inteligencia debe estar entre 1 y 10.');
  });

  it ('debería filtrar personajes por atributo exacto o parcial', async () => {
    const p1: Character = { id: 'P-1', name: 'Rick Sanchez', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 10, description: '' };
    const p2: Character = { id: 'P-2', name: 'Morty Smith', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia Smith', nivelIntelligence: 5, description: '' };
    const p3: Character = { id: 'P-3', name: 'Evil Morty', speciesId: 'sp-1', dimensionId: 'Z-Alpha', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 10, description: '' };
    
    await gestor.agregarPersonaje(p1);
    await gestor.agregarPersonaje(p2);
    await gestor.agregarPersonaje(p3);

    let resultado = gestor.consultarPersonajes({ dimensionId: 'C-137' });
    expect(resultado).toHaveLength(2);

    resultado = gestor.consultarPersonajes({ name: 'morty' });
    expect(resultado).toHaveLength(2);

    resultado = gestor.consultarPersonajes({ affiliation: 'Independiente', state: 'vivo' });
    expect(resultado).toHaveLength(2);
    expect(resultado.map(p => p.name)).toContain('Rick Sanchez');
  });

  it ('debería ordenar personajes por nombre (ascendente y descendente)', async () => {
    await gestor.agregarPersonaje({ id: 'P-1', name: 'Zebra', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: '', nivelIntelligence: 5, description: '' });
    await gestor.agregarPersonaje({ id: 'P-2', name: 'Avocado', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: '', nivelIntelligence: 5, description: '' });
    await gestor.agregarPersonaje({ id: 'P-3', name: 'Morty', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: '', nivelIntelligence: 5, description: '' });

    let resultado = gestor.consultarPersonajes({}, { campo: 'name', direccion: 'asc' });
    expect(resultado[0].name).toBe('Avocado');
    expect(resultado[2].name).toBe('Zebra');

    resultado = gestor.consultarPersonajes({}, { campo: 'name', direccion: 'desc' });
    expect(resultado[0].name).toBe('Zebra');
    expect(resultado[2].name).toBe('Avocado');
  });

  it ('debería ordenar personajes por inteligencia (ascendente y descendente)', async () => {
    await gestor.agregarPersonaje({ id: 'P-1', name: 'Rick', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: '', nivelIntelligence: 10, description: '' });
    await gestor.agregarPersonaje({ id: 'P-2', name: 'Jerry', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: '', nivelIntelligence: 2, description: '' });
    await gestor.agregarPersonaje({ id: 'P-3', name: 'Morty', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: '', nivelIntelligence: 5, description: '' });

    let resultado = gestor.consultarPersonajes({}, { campo: 'nivelIntelligence', direccion: 'asc' });
    expect(resultado[0].name).toBe('Jerry');
    expect(resultado[2].name).toBe('Rick');

    resultado = gestor.consultarPersonajes({}, { campo: 'nivelIntelligence', direccion: 'desc' });
    expect(resultado[0].name).toBe('Rick');  
    expect(resultado[2].name).toBe('Jerry'); 
  });

  it ('debería combinar filtros y ordenación simultáneamente', async () => {
    await gestor.agregarPersonaje({ id: 'P-1', name: 'Rick Sanchez', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 10, description: '' });
    await gestor.agregarPersonaje({ id: 'P-2', name: 'Rick Tonto', speciesId: 'sp-1', dimensionId: 'J19', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 4, description: '' });
    await gestor.agregarPersonaje({ id: 'P-3', name: 'Morty', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 5, description: '' });

    const resultado = gestor.consultarPersonajes(
      { affiliation: 'Independiente' }, 
      { campo: 'nivelIntelligence', direccion: 'desc' }
    );

    expect(resultado).toHaveLength(2);
    expect(resultado[0].name).toBe('Rick Sanchez');
    expect(resultado[1].name).toBe('Rick Tonto');  
  });

  it ('debería localizar versiones alternativas de un personaje', async () => {
    await gestor.agregarPersonaje({ id: 'P-1', name: 'Rick Sanchez', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 10, description: '' });
    await gestor.agregarPersonaje({ id: 'P-2', name: 'Rick Sanchez', speciesId: 'sp-1', dimensionId: 'Z-Alpha', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 9, description: '' });
    await gestor.agregarPersonaje({ id: 'P-3', name: 'Rick Sanchez', speciesId: 'sp-1', dimensionId: 'J19', state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 6, description: '' });
    await gestor.agregarPersonaje({ id: 'P-4', name: 'Morty', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 5, description: '' });

    const versionesRick = gestor.localizarVersionesAlternativas('P-1');
    expect(versionesRick).toHaveLength(2);
    expect(versionesRick.map(v => v.dimensionId)).toContain('Z-Alpha');
    expect(versionesRick.map(v => v.dimensionId)).toContain('J19');

    const versionesMorty = gestor.localizarVersionesAlternativas('P-4');
    expect(versionesMorty).toHaveLength(0);
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import { Data } from '../../src/database/db.js'; 
import { Low } from 'lowdb';
import { GestorLocalizaciones } from '../../src/gestor/gestorlocalizaciones.js';
import { JSONFilePreset } from 'lowdb/node'
import { Location } from '../../src/interfaces/location.js';

describe('GestorLocalizaciones - Pruebas Unitarias', () => {
  let gestor: GestorLocalizaciones;
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
    dbTest.data.ubicaciones = [];

    // Añadimos una dimensión de prueba para que los personajes puedan referenciarla sin problemas
    dbTest.data.dimensiones = [
      { id: 'C-137', name: 'Tierra', state: 'activa', nivelTecnolog: 10, description: '...' }
    ];
    await dbTest.write();


    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorLocalizaciones(dbTest);
  });

  it ('deberia poder agregar una localización correctamente', async () => {
    expect(gestor.obtenerLocalizaciones()).toHaveLength(0); 
    const nuevaLocalizacion: Location = { id: 'L-1', name: 'Ciudadela de Ricks', type: 'Ciudad', dimensionId: 'C-137', population: 1000, description: '...' };

    await gestor.agregarLocalizacion(nuevaLocalizacion);
    expect(gestor.obtenerLocalizaciones()).toHaveLength(1); 
  });

  it ('debería lanzar un error al agregar una localización con dimensión inexistente', async () => {
    const localizacionInvalida: Location = { id: 'L-2', name: 'Planeta X', type: 'Planeta', dimensionId: 'C-999', population: 5000, description: '...' };

    await expect(gestor.agregarLocalizacion(localizacionInvalida)).rejects.toThrow('La dimensión de origen C-999 no existe en el multiverso.');
  });

  it ('debería eliminar una localización correctamente', async () => {
    const localizacion: Location = { id: 'L-3', name: 'Galaxia XYZ', type: 'Galaxia', dimensionId: 'C-137', population: 1000000, description: '...' };

    await gestor.agregarLocalizacion(localizacion);
    expect(gestor.obtenerLocalizaciones()).toHaveLength(1); 
    await gestor.eliminarLocalizacion('L-3');
    expect(gestor.obtenerLocalizaciones()).toHaveLength(0);
  });
  
  it ('debería lanzar un error al eliminar una localización inexistente', async () => {
    await expect(gestor.eliminarLocalizacion('L-999')).rejects.toThrow('No existe una localización con el ID L-999');
  });

  it ('debería obtener todas las localizaciones correctamente', async () => {
    const localizacion1: Location = { id: 'L-4', name: 'Planeta ABC', type: 'Planeta', dimensionId: 'C-137', population: 2000, description: '...' };
    const localizacion2: Location = { id: 'L-5', name: 'Ciudad XYZ', type: 'Ciudad', dimensionId: 'C-137', population: 5000, description: '...' };

    await gestor.agregarLocalizacion(localizacion1);
    await gestor.agregarLocalizacion(localizacion2);
    
    const localizaciones = gestor.obtenerLocalizaciones();
    expect(localizaciones).toHaveLength(2);
    expect(localizaciones).include(localizacion1);
    expect(localizaciones).include(localizacion2);
  });
});
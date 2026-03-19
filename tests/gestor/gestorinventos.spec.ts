import { describe, it, expect, beforeEach } from 'vitest';
import { Data } from '../../src/database/db.js'; 
import { Low } from 'lowdb';
import { GestorInventos } from '../../src/gestor/gestorinventos.js';
import { JSONFilePreset } from 'lowdb/node'
import { Invention } from '../../src/interfaces/invention.js';


describe('GestorInventos - Pruebas Unitarias', () => {
  let gestor: GestorInventos;
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
    dbTest.data.invenciones = [];

    // Añadimos una dimensión de prueba para que los personajes puedan referenciarla sin problemas
    dbTest.data.dimensiones = [
      { id: 'C-137', name: 'Tierra', state: 'activa', nivelTecnolog: 10, description: '...' }
    ];
    dbTest.data.especies = [
      { id: 'sp-1', name: 'humano', origin: 'tierra', type: 'humaniode', expectancy: 80, description: '...' }
    ];
    dbTest.data.personajes = [
      { id: '1', name: 'Rick', speciesId: 'sp-1', dimensionId: 'C-137', state: 'vivo', affiliation: 'Familia', nivelIntelligence: 3, description: '...' }
    ];


    await dbTest.write();


    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorInventos(dbTest);
  });

  it ('deberia poder agregar un invento correctamente', async () => {
    expect(gestor.obtenerInventos()).toHaveLength(0); 
    const nuevoInvento: Invention = { id: 'I-1', name: 'Portal Gun', inventorId: '1', type: 'Gadget', nivelDanger: 5, description: '...' };

    await gestor.agregarInvento(nuevoInvento);
    expect(gestor.obtenerInventos()).toHaveLength(1); 
  });

  it ('debería lanzar un error al agregar un invento con inventor inexistente', async () => {
    const inventoInvalido: Invention = { id: 'I-2', name: 'Time Machine', inventorId: '999', type: 'Gadget', nivelDanger: 7, description: '...' };  
    await expect(gestor.agregarInvento(inventoInvalido)).rejects.toThrow('El inventor con ID 999 no existe en el multiverso.');
  });

  it ('debería eliminar un invento correctamente', async () => {
    const invento: Invention = { id: 'I-3', name: 'Meeseeks Box', inventorId: '1', type: 'Gadget', nivelDanger: 3, description: '...' };

    await gestor.agregarInvento(invento);
    expect(gestor.obtenerInventos()).toHaveLength(1); 
    await gestor.eliminarInvento('I-3');
    expect(gestor.obtenerInventos()).toHaveLength(0);
  });

  it ('deberia lanzar un error al eliminar un invento inexistente', async () => {
    await expect(gestor.eliminarInvento('I-999')).rejects.toThrow('No existe un invento con el ID I-999');
  });

  it ('deberia devolver una lista de los inventos', async () => {
    const invento1: Invention = { id: 'I-4', name: 'Shrink Ray', inventorId: '1', type: 'Gadget', nivelDanger: 4, description: '...' };
    const invento2: Invention = { id: 'I-5', name: 'Death Crystal', inventorId: '1', type: 'Gadget', nivelDanger: 6, description: '...' };
    
    await gestor.agregarInvento(invento1);
    await gestor.agregarInvento(invento2);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { Data } from '../../src/database/db.js'; 
import { Low } from 'lowdb';
import { GestorDimensiones } from '../../src/gestor/gestordimensiones.js';
import { JSONFilePreset } from 'lowdb/node'
import { Dimension } from '../../src/interfaces/dimension.js';

describe('GestorPersonajes - Pruebas Unitarias', () => {
  let gestor: GestorDimensiones;
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
    dbTest.data.dimensiones = [];
  

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorDimensiones(dbTest);
  });

  it ('debería agregar una dimensión correctamente', async () => {
    expect(gestor.obtenerDimensiones()).toHaveLength(0); 
    const nuevaDimension: Dimension = { id: 'D-1', name: 'Tierra', state: 'activa', nivelTecnolog: 10, description: '...' };
    await gestor.agregarDimension(nuevaDimension);
    expect(gestor.obtenerDimensiones()).toHaveLength(1); 
  });

  it ('debería lanzar un error al agregar una dimensión con ID duplicado', async () => {
    const dimension1: Dimension = { id: 'D-2', name: 'Marte', state: 'destruida', nivelTecnolog: 5, description: '...' };
    const dimension2: Dimension = { id: 'D-2', name: 'Venus', state: 'activa', nivelTecnolog: 7, description: '...' };
    
    await gestor.agregarDimension(dimension1);
    await expect(gestor.agregarDimension(dimension2)).rejects.toThrow('Ya existe una dimensión con el ID D-2');
  });



  it ('debería lanzar un error al agregar una dimensión con nivel de tecnología fuera de 1-10', async () => {
    const dimensionInvalida: Dimension = { id: 'D-3', name: 'Venus', state: 'activa', nivelTecnolog: 15, description: '...' };

    await expect(gestor.agregarDimension(dimensionInvalida)).rejects.toThrow('El nivel tecnológico debe estar entre 1 y 10. Valor recibido: 15');
  });

  it ('debería eliminar una dimensión correctamente', async () => {
    const dimension: Dimension = { id: 'D-3', name: 'Venus', state: 'activa', nivelTecnolog: 5, description: '...' };

    await gestor.agregarDimension(dimension);
    expect(gestor.obtenerDimensiones()).toHaveLength(1); 
    await gestor.eliminarDimension('D-3');
    expect(gestor.obtenerDimensiones()).toHaveLength(0); 
  });
  
  it ('debería lanzar un error al eliminar una dimensión inexistente', async () => {
    await expect(gestor.eliminarDimension('D-999')).rejects.toThrow('No existe una dimensión con el ID D-999');
  });

  it ('debería retornar la lista de dimensiones correctamente', async () => {
    const dimension1: Dimension = { id: 'D-1', name: 'Tierra', state: 'activa', nivelTecnolog: 10, description: '...' };
    const dimension2: Dimension = { id: 'D-2', name: 'Marte', state: 'destruida', nivelTecnolog: 5, description: '...' };
    
    await gestor.agregarDimension(dimension1);
    await gestor.agregarDimension(dimension2);

    const dimensiones = gestor.obtenerDimensiones();
    expect(dimensiones).toHaveLength(2);
    expect(dimensiones).include(dimension1);
    expect(dimensiones).include(dimension2);
  });

});
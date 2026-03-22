import { describe, it, expect, beforeEach } from 'vitest';
import { Data } from '../../src/database/db.js'; 
import { Low } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { GestorAlteracionesDimensionales } from '../../src/gestor/gestoralteracionesdimensionales.js'; 
import { Dimension } from '../../src/interfaces/dimension.js';
import { Character } from '../../src/interfaces/character.js';

describe('GestorAlteracionesDimensionales - Registro de Alteraciones', () => {
  let gestorAlteraciones: GestorAlteracionesDimensionales;

  beforeEach(async () => {
    let dbTest: Low<Data> = await JSONFilePreset<Data>('src/database/test-db.json', {
      dimensiones: [],
      personajes: [],
      especies: [],
      ubicaciones: [],
      invenciones: [],
      viajes: [],
      alteracionesDimensionales: []
    });

    dbTest.data.dimensiones = [];
    dbTest.data.personajes = [];
    dbTest.data.alteracionesDimensionales = [];
    await dbTest.write();

    gestorAlteraciones = new GestorAlteracionesDimensionales(dbTest);
  });

  it('debería registrar la creación de una dimensión por un experimento', async () => {
    const nuevaDimension: Dimension = { id: 'D-X', name: 'Dimensión X', state: 'activa', nivelTecnolog: 9, description: 'Creada en laboratorio' };
    
    await gestorAlteraciones.registrarAlteracion({
      id: 'ALT-1',
      tipo: 'creacion',
      causa: 'experimento',
      dimensionId: 'D-X',
      fecha: new Date().toISOString(),
      descripcion: 'Experimento fallido de Rick'
    }, nuevaDimension);

    const dimensiones = (gestorAlteraciones as any).db.data.dimensiones; 
    const existe = dimensiones.find((d: Dimension) => d.id === 'D-X');
    
    expect(existe).toBeDefined();
    expect(existe?.state).toBe('activa');
    
    const alteraciones = (gestorAlteraciones as any).db.data.alteracionesDimensionales;
    expect(alteraciones).toHaveLength(1);
    expect(alteraciones[0].id).toBe('ALT-1');
  });

  it('debería registrar la destrucción de una dimensión por paradoja y actualizar personajes originarios', async () => {
    const dimY: Dimension = { id: 'D-Y', name: 'Dimensión Y', state: 'activa', nivelTecnolog: 5, description: '' };
    const habitante: Character = { id: 'P-99', name: 'Habitante Y', speciesId: 'sp-1', dimensionId: 'D-Y', state: 'vivo', affiliation: '', nivelIntelligence: 5, description: '' };
    
    const db = (gestorAlteraciones as any).db;
    db.data.dimensiones.push(dimY);
    db.data.personajes.push(habitante);
    await db.write();

    await gestorAlteraciones.registrarAlteracion({
      id: 'ALT-2',
      tipo: 'destruccion',
      causa: 'paradoja',
      dimensionId: 'D-Y',
      fecha: new Date().toISOString(),
      descripcion: 'Paradoja temporal severa'
    });

    const dimDestruida = db.data.dimensiones.find((d: Dimension) => d.id === 'D-Y');
    expect(dimDestruida?.state).toBe('destruida');

    const personajeAfectado = db.data.personajes.find((p: Character) => p.id === 'P-99');
    expect(personajeAfectado?.state).toBe('desconocido');
  });

  it('debería lanzar un error al intentar crear una dimensión sin pasar sus datos', async () => {
    await expect(
      gestorAlteraciones.registrarAlteracion({
        id: 'ALT-3',
        tipo: 'creacion',
        causa: 'experimento',
        dimensionId: 'D-Z',
        fecha: new Date().toISOString(),
        descripcion: ''
      })
    ).rejects.toThrow('Se requieren los datos de la nueva dimensión para crearla.');
  });

  it('debería lanzar un error al intentar destruir una dimensión que no existe', async () => {
    await expect(
      gestorAlteraciones.registrarAlteracion({
        id: 'ALT-4',
        tipo: 'destruccion',
        causa: 'paradoja',
        dimensionId: 'D-INVENTADA',
        fecha: new Date().toISOString(),
        descripcion: ''
      })
    ).rejects.toThrow('La dimensión con ID D-INVENTADA no existe en el multiverso.');
  });
});
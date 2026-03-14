import { describe, it, expect, beforeEach } from 'vitest';

import { GestorMultiverso } from '../src/gestor/gestor.js';
import { Character } from '../src/interfaces/character.js';
import { Dimension } from '../src/interfaces/dimension.js'

describe('GestorMultiverso - Lógica de Negocio', () => {
  let gestor: GestorMultiverso;

  beforeEach(() => {
    gestor = new GestorMultiverso();
  });

  describe('Gestión de Dimensiones', () => {
    it('debería añadir una dimensión correctamente si los datos son válidos', () => {
      const dimensionActiva: Dimension = {id: 'C-137', name: 'Tierra C-137', state: 'activa',
        nivelTecnolog: 8, description: 'Hogar'
      };

      gestor.agregarDimension(dimensionActiva);
      const dimensiones = gestor.obtenerDimensiones();
      
      expect(dimensiones.length).toBe(1);
      expect(dimensiones[0].id).toBe('C-137');
    });

    it('debería lanzar un error si el nivel tecnológico es menor que 1 o mayor que 10', () => {
      const dimensionInvalida: Dimension = {
        id: 'Z-99', name: 'Mundo Dios', state: 'activa',
        nivelTecnolog: 15, // DATO INVÁLIDO
        description: 'Tecnología incomprensible'
      };

      // Comprobamos que lanza un error al no estar entre 1-10
      expect(() => {
        gestor.agregarDimension(dimensionInvalida);
      }).toThrowError('El nivel tecnológico debe estar entre 1 y 10');
    });
  });

  describe('Gestión de Personajes', () => {
    it('debería lanzar un error si se añade un personaje cuya dimensión no existe', () => {
      const personajeHuerfano: Character = {
        id: 'P-01', name: 'Morty Malvado', speciesId: 'E-01',
        dimensionId: 'X-999', // ESTA DIMENSIÓN NO HA SIDO AÑADIDA AL GESTOR
        state: 'vivo', affiliation: 'Independiente', nivelIntelligence: 9, description: '...'
      };

      expect(() => {
        gestor.agregarPersonaje(personajeHuerfano);
      }).toThrowError('La dimensión de origen X-999 no existe en el multiverso.');
    });
  });
});
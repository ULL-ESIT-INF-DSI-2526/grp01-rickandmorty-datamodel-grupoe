import { describe, it, expect, beforeEach } from "vitest";
import { Data } from "../../src/database/db.js";
import { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { GestorInformes } from "../../src/gestor/gestorinformes.js";
import { GestorDimensiones } from "../../src/gestor/gestordimensiones.js";
import { GestorPersonajes } from "../../src/gestor/gestorpersonajes.js";

describe("GestorInformes - Pruebas Unitarias", () => {
  let gestor: GestorInformes;
  let gestordim: GestorDimensiones;
  let gestorpers: GestorPersonajes;

  beforeEach(async () => {
    // Vamos a usar una base de datos de prueba para no tocar la real
    let dbTest: Low<Data> = await JSONFilePreset<Data>(
      "src/database/test-db.json",
      {
        dimensiones: [],
        personajes: [],
        especies: [],
        ubicaciones: [],
        invenciones: [],
        viajes: [],
        alteracionesDimensionales: [],
      },
    );

    // Añadimos una dimension activa y otra inactiva para probar el informe
    dbTest.data.dimensiones = [
      {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      {
        id: "J19",
        name: "Dimensión Doofus",
        state: "cuarentena",
        nivelTecnolog: 6,
        description: "...",
      },
    ];
    await dbTest.write();

    // Añadimos personajes para probar el informe de versiones alternativas
    dbTest.data.personajes = [
      {
        id: "1",
        name: "Rick Sanchez",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "C-137",
        nivelIntelligence: 10,
        description: "...",
      },
      {
        id: "2",
        name: "Rick Prime",
        speciesId: "sp-1",
        dimensionId: "J19",
        state: "vivo",
        affiliation: "J19",
        nivelIntelligence: 9,
        description: "...",
      },
      {
        id: "3",
        name: "Morty Smith",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "C-137",
        nivelIntelligence: 5,
        description: "...",
      },
      {
        id: "4",
        name: "Summer Smith",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "C-137",
        nivelIntelligence: 6,
        description: "...",
      },
      {
        id: "5",
        name: "Morty Prime",
        speciesId: "sp-1",
        dimensionId: "J19",
        state: "vivo",
        affiliation: "J19",
        nivelIntelligence: 4,
        description: "...",
      }
    ];
    await dbTest.write();

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorInformes(dbTest);
    gestordim = new GestorDimensiones(dbTest);
    gestorpers = new GestorPersonajes(dbTest);
  });

  it("deberia listar solo las dimensiones activas y calcular la media correctamente", () => {
    const informe = gestor.listarDimensionesActivas();
    expect(informe.dimensiones).toHaveLength(1);
    expect(informe.dimensiones[0].id).toBe("C-137");
    expect(informe.media).toBe(10);
  });

  it("deberia retornar media 0 si no hay dimensiones activas", async () => {
    // Borramos la dimension activa para probar el caso sin activas
    await gestordim.eliminarDimension("C-137");
    const informe = gestor.listarDimensionesActivas();
    expect(informe.dimensiones).toHaveLength(0);
    expect(informe.media).toBe(0);
  });

  it("deberia contar correctamente las versiones alternativas de los personajes", async () => {
    const informe = gestor.informeVersionesAlternativas();
    expect(informe).toHaveLength(2);
    expect(informe[0].nombreBase).toBe("rick");
    expect(informe[0].cantidad).toBe(2);
  });

  it("deberia retornar un array vacio si no hay personajes con versiones alternativas", async () => {
    // Borramos todos los personajes para probar el caso sin versiones alternativas
    await gestorpers.eliminarPersonaje("1");
    await gestorpers.eliminarPersonaje("2");
    await gestorpers.eliminarPersonaje("3");
    await gestorpers.eliminarPersonaje("4");
    await gestorpers.eliminarPersonaje("5");
    const informe = gestor.informeVersionesAlternativas();
    expect(informe).toHaveLength(0);
  });
});
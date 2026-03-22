import { describe, it, expect, beforeEach } from "vitest";
import { Data } from "../../src/database/db.js";
import { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { GestorEventos } from "../../src/gestor/gestoreventos.js";

describe("GestorEventos - Pruebas Unitarias", () => {
  let gestor: GestorEventos;
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
        eventos: [],
      },
    );

    // Limipiamos la sección de personajes para empezar cada test con una base de datos limpia
    dbTest.data.eventos = [];

    // Añadimos una dimensión de prueba para que los personajes puedan referenciarla sin problemas
    dbTest.data.dimensiones = [
      {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
    ];
    dbTest.data.especies = [
      {
        id: "sp-1",
        name: "humano",
        origin: "tierra",
        type: "humaniode",
        expectancy: 80,
        description: "...",
      },
    ];
    dbTest.data.personajes = [
      {
        id: "1",
        name: "Rick Sanchez",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
    ];
    dbTest.data.ubicaciones = [
      {
        id: "LOC-01",
        name: "Ciudadela de Ricks",
        type: "ciudad",
        dimensionId: "C-137",
        population: 1000000,
        description: "...",
      },
    ];
    dbTest.data.invenciones = [
      {
        id: "INV-01",
        name: "Portal Gun",
        inventorId: "1",
        type: "transporte",
        nivelDanger: 8,
        description: "...",
      },
    ];
    await dbTest.write();

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorEventos(dbTest);

  });

  it("Debería registrar un evento de despliegue de artefacto correctamente", async () => {
    expect(gestor.consultarEventos()).toHaveLength(0);

    await gestor.desplegarArtefacto("INV-01", "LOC-01");

    const eventos = gestor.consultarEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toMatchObject({
      artefactoId: "INV-01",
      localizacionId: "LOC-01",
    });
  });

  it("Debería eliminar un evento correctamente", async () => {
    await gestor.desplegarArtefacto("INV-01", "LOC-01");
    const eventos = gestor.consultarEventos();
    expect(eventos).toHaveLength(1);

    const eventoId = eventos[0].id;
    await gestor.eliminarEvento(eventoId);

    const eventosDespues = gestor.consultarEventos();
    expect(eventosDespues).toHaveLength(0);
  });

  it("Debería manejar errores al desplegar artefactos o localizaciones inexistentes", async () => {
    await expect(gestor.desplegarArtefacto("INV-999", "LOC-01")).rejects.toThrow(
      "No se puede desplegar: El artefacto con ID INV-999 no existe.",
    );

    await expect(gestor.desplegarArtefacto("INV-01", "LOC-999")).rejects.toThrow(
      "No se puede desplegar: La localización con ID LOC-999 no existe.",
    );
  });

  it ('deberia consultar eventos correctamente', async () => {
    await gestor.desplegarArtefacto("INV-01", "LOC-01");
    const eventos = gestor.consultarEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toMatchObject({
      artefactoId: "INV-01",
      localizacionId: "LOC-01",
    });
  });

});
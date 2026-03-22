import { describe, it, expect, beforeEach } from "vitest";
import { Data } from "../../src/database/db.js";
import { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { GestorViajes } from "../../src/gestor/gestorviajes.js";
import { Travel } from "../../src/interfaces/travels.js";

describe("GestorViajes - Pruebas Unitarias", () => {
  let gestor: GestorViajes;
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

    // Limipiamos la sección de personajes para empezar cada test con una base de datos limpia
    dbTest.data.viajes = [];

    // Añadimos una dimensión de prueba para que los personajes puedan referenciarla sin problemas
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
        state: "activa",
        nivelTecnolog: 6,
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
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
    ];

    await dbTest.write();

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorViajes(dbTest);
  });

  it("deberia poder agregar un viaje correctamente", async () => {
    expect(gestor.obtenerViajes()).toHaveLength(0);
    const nuevoViaje: Travel = {
      id: "V-1",
      traveler: {
        id: "1",
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      destination: {
        id: "J19",
        name: "Dimensión Doofus",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      date: new Date(),
      motive: "Explorar nuevas dimensiones",
    };

    await gestor.agregarViaje(nuevoViaje);
    expect(gestor.obtenerViajes()).toHaveLength(1);
  });

  it("debería lanzar un error al agregar un viaje con viajero inexistente", async () => {
    const viajeInvalido: Travel = {
      id: "V-2",
      traveler: {
        id: "999",
        name: "Desconocido",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      destination: {
        id: "J19",
        name: "Dimensión Doofus",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      date: new Date(),
      motive: "Algo aleatorio",
    };
    await expect(gestor.agregarViaje(viajeInvalido)).rejects.toThrow(
      "El viajero con ID 999 no existe en el multiverso.",
    );
  });

  it("debería lanzar un error al agregar un viaje con dimensión de origen inexistente", async () => {
    const viajeInvalido: Travel = {
      id: "V-3",
      traveler: {
        id: "1",
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "C-999",
        name: "Dimensión Desconocida",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      destination: {
        id: "J19",
        name: "Dimensión Doofus",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      date: new Date(),
      motive: "Algo aleatorio",
    };
    await expect(gestor.agregarViaje(viajeInvalido)).rejects.toThrow(
      "La dimensión de origen C-999 no existe en el multiverso.",
    );
  });

  it("debería lanzar un error al agregar un viaje con dimensión de destino inexistente", async () => {
    const viajeInvalido: Travel = {
      id: "V-4",
      traveler: {
        id: "1",
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      destination: {
        id: "J-999",
        name: "Dimensión Desconocida",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      date: new Date(),
      motive: "Algo aleatorio",
    };
    await expect(gestor.agregarViaje(viajeInvalido)).rejects.toThrow(
      "La dimensión de destino J-999 no existe en el multiverso.",
    );
  });

  it("debería eliminar un viaje correctamente", async () => {
    const viaje: Travel = {
      id: "V-5",
      traveler: {
        id: "1",
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      destination: {
        id: "J19",
        name: "Dimensión Doofus",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      date: new Date(),
      motive: "Explorar nuevas dimensiones",
    };
    await gestor.agregarViaje(viaje);
    expect(gestor.obtenerViajes()).toHaveLength(1);

    await gestor.eliminarViaje("V-5");
    expect(gestor.obtenerViajes()).toHaveLength(0);
  });

  it("debería lanzar un error al eliminar un viaje inexistente", async () => {
    await expect(gestor.eliminarViaje("V-999")).rejects.toThrow(
      "No existe un viaje con el ID V-999",
    );
  });

  it("debería obtener el historial de viajes por viajero", async () => {
    const viaje1: Travel = {
      id: "V-6",
      traveler: {
        id: "1",
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      destination: {
        id: "J19",
        name: "Dimensión Doofus",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      date: new Date(),
      motive: "Explorar nuevas dimensiones",
    };
    const viaje2: Travel = {
      id: "V-7",
      traveler: {
        id: "1",
        name: "Rick",
        speciesId: "sp-1",
        dimensionId: "C-137",
        state: "vivo",
        affiliation: "Familia",
        nivelIntelligence: 3,
        description: "...",
      },
      origin: {
        id: "J19",
        name: "Dimensión Doofus",
        state: "activa",
        nivelTecnolog: 6,
        description: "...",
      },
      destination: {
        id: "C-137",
        name: "Tierra",
        state: "activa",
        nivelTecnolog: 10,
        description: "...",
      },
      date: new Date(),
      motive: "Regresar a casa",
    };
    await gestor.agregarViaje(viaje1);
    await gestor.agregarViaje(viaje2);

    const historial = gestor.obtenerHistorialViajesPorViajero("1");
    expect(historial).toHaveLength(2);
    expect(historial[0]).toContain(
      "Viaje ID: V-6 Origen: Tierra (ID: C-137) Destino: Dimensión Doofus (ID: J19)",
    );
    expect(historial[1]).toContain(
      "Viaje ID: V-7 Origen: Dimensión Doofus (ID: J19) Destino: Tierra (ID: C-137)",
    );
  });
});

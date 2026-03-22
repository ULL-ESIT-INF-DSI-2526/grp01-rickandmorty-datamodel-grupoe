import { describe, it, expect, beforeEach } from "vitest";
import { Data } from "../../src/database/db.js";
import { Low } from "lowdb";
import { GestorLocalizaciones } from "../../src/gestor/gestorlocalizaciones.js";
import { JSONFilePreset } from "lowdb/node";
import { Location } from "../../src/interfaces/location.js";

describe("GestorLocalizaciones - Pruebas Unitarias", () => {
  let gestor: GestorLocalizaciones;
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
    dbTest.data.ubicaciones = [];

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
    await dbTest.write();

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorLocalizaciones(dbTest);
  });

  it("deberia poder agregar una localización correctamente", async () => {
    expect(gestor.obtenerLocalizaciones()).toHaveLength(0);
    const nuevaLocalizacion: Location = {
      id: "L-1",
      name: "Ciudadela de Ricks",
      type: "Ciudad",
      dimensionId: "C-137",
      population: 1000,
      description: "...",
    };

    await gestor.agregarLocalizacion(nuevaLocalizacion);
    expect(gestor.obtenerLocalizaciones()).toHaveLength(1);
  });

  it("debería lanzar un error al agregar una localización con dimensión inexistente", async () => {
    const localizacionInvalida: Location = {
      id: "L-2",
      name: "Planeta X",
      type: "Planeta",
      dimensionId: "C-999",
      population: 5000,
      description: "...",
    };

    await expect(
      gestor.agregarLocalizacion(localizacionInvalida),
    ).rejects.toThrow(
      "La dimensión de origen C-999 no existe en el multiverso.",
    );
  });

  it("debería eliminar una localización correctamente", async () => {
    const localizacion: Location = {
      id: "L-3",
      name: "Galaxia XYZ",
      type: "Galaxia",
      dimensionId: "C-137",
      population: 1000000,
      description: "...",
    };

    await gestor.agregarLocalizacion(localizacion);
    expect(gestor.obtenerLocalizaciones()).toHaveLength(1);
    await gestor.eliminarLocalizacion("L-3");
    expect(gestor.obtenerLocalizaciones()).toHaveLength(0);
  });

  it("debería lanzar un error al eliminar una localización inexistente", async () => {
    await expect(gestor.eliminarLocalizacion("L-999")).rejects.toThrow(
      "No existe una localización con el ID L-999",
    );
  });

  it("debería obtener todas las localizaciones correctamente", async () => {
    const localizacion1: Location = {
      id: "L-4",
      name: "Planeta ABC",
      type: "Planeta",
      dimensionId: "C-137",
      population: 2000,
      description: "...",
    };
    const localizacion2: Location = {
      id: "L-5",
      name: "Ciudad XYZ",
      type: "Ciudad",
      dimensionId: "C-137",
      population: 5000,
      description: "...",
    };

    await gestor.agregarLocalizacion(localizacion1);
    await gestor.agregarLocalizacion(localizacion2);

    const localizaciones = gestor.obtenerLocalizaciones();
    expect(localizaciones).toHaveLength(2);
    expect(localizaciones).include(localizacion1);
    expect(localizaciones).include(localizacion2);
  });

  it("Debería de modificar los campos de una localización", async () => {
    const localizacion: Location = {
      id: "L-6",
      name: "Planeta DEF",
      type: "Planeta",
      dimensionId: "C-137",
      population: 3000,
      description: "Un lugar",
    };
    await gestor.agregarLocalizacion(localizacion);

    await gestor.modificarLocalizacion("L-6", {
      name: "Planeta DEF Modificado",
      type: "Simulación",
      dimensionId: "J19",
      population: 3500,
      description: "Un lugar modificado",
    });

    const localizaciones = gestor.obtenerLocalizaciones();
    const localizacionModificada = localizaciones.find((l) => l.id === "L-6");

    expect(localizacionModificada?.name).toBe("Planeta DEF Modificado");
    expect(localizacionModificada?.population).toBe(3500);
    expect(localizacionModificada?.description).toBe("Un lugar modificado");
    expect(localizacionModificada?.type).toBe("Simulación");
    expect(localizacionModificada?.dimensionId).toBe("J19");
  });

  it("Consultar localizaciones con filtro", async () => {
    const localizacion1: Location = {
      id: "L-7",
      name: "Planeta GHI",
      type: "Planeta",
      dimensionId: "C-137",
      population: 4000,
      description: "...",
    };
    const localizacion2: Location = {
      id: "L-8",
      name: "Ciudad UVW",
      type: "Ciudad",
      dimensionId: "C-137",
      population: 6000,
      description: "...",
    };
    const localizacion3: Location = {
      id: "L-9",
      name: "Planeta JKL",
      type: "Planeta",
      dimensionId: "J19",
      population: 4500,
      description: "...",
    };

    await gestor.agregarLocalizacion(localizacion1);
    await gestor.agregarLocalizacion(localizacion2);
    await gestor.agregarLocalizacion(localizacion3);

    const resultado = gestor.consultarLocalizacion({ type: "Planeta" });
    expect(resultado).toHaveLength(2);
    expect(resultado).include(localizacion1);
    expect(resultado).include(localizacion3);

    const resultado2 = gestor.consultarLocalizacion({ dimensionId: "C-137" });
    expect(resultado2).toHaveLength(2);
    expect(resultado2).include(localizacion1);
    expect(resultado2).include(localizacion2);

    const resultado3 = gestor.consultarLocalizacion({ name: "Ciudad UVW" });
    expect(resultado3).toHaveLength(1);
    expect(resultado3[0]).toEqual(localizacion2);
  });
});

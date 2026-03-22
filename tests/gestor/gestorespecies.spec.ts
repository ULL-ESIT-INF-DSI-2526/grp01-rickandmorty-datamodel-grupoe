import { describe, it, expect, beforeEach } from "vitest";
import { Data } from "../../src/database/db.js";
import { Low } from "lowdb";
import { GestorEspecies } from "../../src/gestor/gestorespecies.js";
import { JSONFilePreset } from "lowdb/node";
import { Species } from "../../src/interfaces/species.js";

describe("GestorEspecies - Pruebas Unitarias", () => {
  let gestor: GestorEspecies;
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
    dbTest.data.especies = [];

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorEspecies(dbTest);
  });

  it("debería agregar una especie correctamente", async () => {
    expect(gestor.obtenerEspecies()).toHaveLength(0);
    const nuevaEspecie: Species = {
      id: "sp-1",
      name: "Humano",
      origin: "Tierra",
      type: "amorfo",
      expectancy: 80,
      description: "...",
    };

    await gestor.agregarEspecie(nuevaEspecie);
    expect(gestor.obtenerEspecies()).toHaveLength(1);
  });

  it("debería lanzar un error al intentar agregar una especie con un ID ya existente", async () => {
    const especie1: Species = {
      id: "sp-1",
      name: "Humano",
      origin: "Tierra",
      type: "humanoide",
      expectancy: 80,
      description: "...",
    };
    const especie2: Species = {
      id: "sp-1",
      name: "Alienígena",
      origin: "Planeta",
      type: "amorfo",
      expectancy: 150,
      description: "...",
    };

    await gestor.agregarEspecie(especie1);
    await expect(gestor.agregarEspecie(especie2)).rejects.toThrow(
      `Ya existe una especie con el ID ${especie2.id}`,
    );
  });

  it("debería eliminar una especie correctamente", async () => {
    const especie: Species = {
      id: "sp-1",
      name: "Humano",
      origin: "Tierra",
      type: "humanoide",
      expectancy: 80,
      description: "...",
    };

    await gestor.agregarEspecie(especie);
    expect(gestor.obtenerEspecies()).toHaveLength(1);

    await gestor.eliminarEspecie(especie.id);
    expect(gestor.obtenerEspecies()).toHaveLength(0);
  });

  it("debería lanzar un error al intentar eliminar una especie que no existe", async () => {
    await expect(gestor.eliminarEspecie("sp-999")).rejects.toThrow(
      `No existe una especie con el ID sp-999`,
    );
  });

  it("debería devolver una lista con todas las especies registradas", async () => {
    const especie1: Species = {
      id: "sp-1",
      name: "Humano",
      origin: "Tierra",
      type: "humanoide",
      expectancy: 80,
      description: "...",
    };
    const especie2: Species = {
      id: "sp-2",
      name: "Alienígena",
      origin: "Planeta X",
      type: "amorfo",
      expectancy: 150,
      description: "...",
    };
    const especie3: Species = {
      id: "sp-3",
      name: "Robot",
      origin: "Artificial",
      type: "mecánico",
      expectancy: 1000,
      description: "...",
    };

    await gestor.agregarEspecie(especie1);
    await gestor.agregarEspecie(especie2);
    await gestor.agregarEspecie(especie3);

    const especies = gestor.obtenerEspecies();
    expect(especies).toHaveLength(3);
    expect(especies).toContainEqual(especie1);
    expect(especies).toContainEqual(especie2);
    expect(especies).toContainEqual(especie3);
  });

  it("debería modificar una especie existente correctamente", async () => {
    const especieOriginal: Species = {
      id: "sp-1",
      name: "Humano",
      origin: "Tierra",
      type: "humanoide",
      expectancy: 80,
      description: "...",
    };
    await gestor.agregarEspecie(especieOriginal);

    await gestor.modificarEspecie("sp-1", {
      name: "Humano Modificado",
      expectancy: 90,
      description: "Descripción actualizada",
      origin: "Tierra",
      type: "humanoide",
    });

    const especies = gestor.obtenerEspecies();
    expect(especies).toHaveLength(1);
    expect(especies[0]).toEqual({
      id: "sp-1",
      name: "Humano Modificado",
      expectancy: 90,
      description: "Descripción actualizada",
      origin: "Tierra",
      type: "humanoide",
    });
  });

  it("debería lanzar un error al intentar modificar una especie que no existe", async () => {
    await expect(
      gestor.modificarEspecie("sp-999", {
        name: "Especie Fantasma",
        origin: "Desconocido",
        type: "desconocido",
        expectancy: 0,
        description: "...",
      }),
    ).rejects.toThrow(`No existe una especie con el ID sp-999`);
  });

  it("debería permitir modificar solo algunos campos de la especie sin afectar los demás", async () => {
    const especieOriginal: Species = {
      id: "sp-1",
      name: "Humano",
      origin: "Tierra",
      type: "humanoide",
      expectancy: 80,
      description: "...",
    };
    await gestor.agregarEspecie(especieOriginal);

    await gestor.modificarEspecie("sp-1", {
      name: "Humano Modificado",
      expectancy: 90,
      origin: "Tierra",
      type: "humanoide",
    });

    const especies = gestor.obtenerEspecies();
    expect(especies).toHaveLength(1);
    expect(especies[0]).toEqual({
      id: "sp-1",
      name: "Humano Modificado",
      expectancy: 90,
      description: "...",
      origin: "Tierra",
      type: "humanoide",
    });
  });
});

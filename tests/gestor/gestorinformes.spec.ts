import { describe, it, expect, beforeEach } from "vitest";
import { Data } from "../../src/database/db.js";
import { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import { GestorInformes } from "../../src/gestor/gestorinformes.js";
import { GestorDimensiones } from "../../src/gestor/gestordimensiones.js";

describe("GestorInformes - Pruebas Unitarias", () => {
  let gestor: GestorInformes;
  let gestordim: GestorDimensiones;

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

    // Instanciamos el gestor pasandole esta base de datos de mentira
    gestor = new GestorInformes(dbTest);
    gestordim = new GestorDimensiones(dbTest);
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
});
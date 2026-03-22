import prompts from "prompts";
import { Species } from "../interfaces/species.js";
import { GestorMultiverso } from "../gestor/gestor.js";

async function pausar(): Promise<void> {
  await prompts({
    type: "invisible",
    name: "p",
    message: "Presiona Enter para continuar...",
  });
}

export async function menuEspecies(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
    console.clear();

    const respuesta = await prompts<"accion">({
      type: "select",
      name: "accion",
      message: "--- GESTIÓN DE ESPECIES ---\n¿Qué operación deseas realizar?",
      choices: [
        { title: "Añadir especie", value: "add" },
        { title: "Eliminar especie", value: "delete" },
        { title: "Modificar especie", value: "update" },
        { title: "Volver al menú principal", value: "back" },
      ],
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case "add":
        await flujoAñadirEspecie(gestor);
        await pausar();
        break;
      case "delete":
        await flujoEliminarEspecie(gestor);
        await pausar();
        break;
      case "update":
        await flujoModificarEspecie(gestor);
        await pausar();
        break;
      case "back":
        volver = true;
        break;
    }
  }
}

/**
 * Flujo interactivo para pedir los datos y crear un nueva especie.
 */
async function flujoAñadirEspecie(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- REGISTRO DE LA NUEVA ESPECIE ---");
  // Asegurarse que los name sean igual que lo de las interfaces para que no de fallos al pasarlo al tipo de datos del Species
  const datos = await prompts([
    {
      type: "text",
      name: "id",
      message: "ID de la especie (Ej: sp-1):",
      validate: (v) => (v.length > 0 ? true : "El ID es obligatorio."),
    },
    {
      type: "text",
      name: "name",
      message: "Nombre de la especie:",
    },
    {
      type: "text",
      name: "origin",
      message: "Planeta o dimension donde surgio la especie:",
    },
    {
      type: "select",
      name: "type",
      message: "Clasificación de tipo de especie:",
      choices: [
        { title: "humanoide", value: "humanoide" },
        { title: "amorfo", value: "amorfo" },
        { title: "robótico", value: "robótico" },
        { title: "parásito", value: "parásito" },
        { title: "hivemind", value: "hivemind" },
      ],
    },
    {
      type: "number",
      name: "expectancy",
      message: "Esperanza de vida en años:",
      min: 0,
      max: 10000,
    },
    {
      type: "text",
      name: "description",
      message: "Breve descripción:",
    },
  ]);

  // Si el usuario cancela a mitad de las preguntas
  if (!datos.id) {
    console.log("\n-Operación cancelada.-");
    return;
  }

  try {
    // Forzamos el tipado a Species
    const nuevaEspecie = datos as Species;
    // Llamamos a la función del gestor, que hará las comprobaciones de necesarios para ver si el personaje es válido
    await gestor.especies.agregarEspecie(nuevaEspecie);
    // Si todo va bien
    console.log(
      `\n ¡Éxito! La especie ${nuevaEspecie.name} ha sido añadida al multiverso.`,
    );
  } catch (error: any) {
    // Si se intorudce un dato incorrecto, el error se mostrará aquí
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Funcion para eliminar una especie de la db
 */
async function flujoEliminarEspecie(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- ELIMINAR ESPECIE ---");
  const especies = gestor.especies.obtenerEspecies();
  if (especies.length === 0) {
    console.log("\nNo hay especies registradas en el multiverso.");
    return;
  }

  const respuesta = await prompts({
    type: "select",
    name: "id",
    message: "Selecciona la especie que deseas eliminar:",
    choices: especies.map((e) => ({
      title: `${e.name} (ID: ${e.id})`,
      value: e.id,
    })),
  });

  if (!respuesta.id) {
    console.log("\n-Operación cancelada.-");
    return;
  }

  try {
    await gestor.especies.eliminarEspecie(respuesta.id);
    console.log("\n¡Especie eliminada exitosamente!");
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Flujo interactivo para seleccionar y modificar los campos de una especie uno a uno.
 */
async function flujoModificarEspecie(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- MODIFICAR ESPECIE ---");
  const especies = gestor.especies.obtenerEspecies();
  if (especies.length === 0) {
    console.log("\nNo hay especies registradas en el multiverso.");
    return;
  }

  const respuesta = await prompts({
    type: "select",
    name: "id",
    message: "Selecciona la especie que deseas modificar:",
    choices: especies.map((e) => ({
      title: `${e.name} (ID: ${e.id})`,
      value: e.id,
    })),
  });

  if (!respuesta.id) return;

  // Creación de una copia temporal de la especie para no modificar el original
  const especieOriginal = especies.find((e) => e.id === respuesta.id);
  if (!especieOriginal) {
    console.log("\nNo se encontró la especie seleccionada.");
    return;
  }

  let copiaEspecie: Species = { ...especieOriginal };
  let editando: boolean = true;

  while (editando) {
    console.clear();
    console.log("--- EDITANDO ESPECIE ---");
    console.log("Datos actuales que se van a guardar:");
    console.table(copiaEspecie);
    console.log("--------------------------\n");

    const menuEdicion = await prompts({
      type: "select",
      name: "campo",
      message: "¿Qué campo deseas modificar?",
      choices: [
        { title: "Nombre", value: "name" },
        { title: "Planeta/Dimensión origen", value: "origin" },
        { title: "Tipo", value: "type" },
        { title: "Esperanza de vida", value: "expectancy" },
        { title: "Descripción", value: "description" },
        { title: "Guardar cambios y salir", value: "save" },
        { title: "Descartar cambios y salir", value: "cancel" },
      ],
    });

    if (!menuEdicion.campo || menuEdicion.campo === "cancel") {
      console.log("\nModificación descartada.");
      editando = false;
      continue;
    }

    if (menuEdicion.campo === "save") {
      try {
        await gestor.especies.modificarEspecie(respuesta.id, copiaEspecie);
        console.log("\n¡Especie actualizada y guardada con éxito!");
      } catch (error: any) {
        console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
      }
      editando = false;
      continue;
    }

    let tipoPrompt: "text" | "select" | "number" = "text";
    let opcionesSelect: any = undefined;
    let valorInicial: any = copiaEspecie[menuEdicion.campo as keyof Species];

    if (menuEdicion.campo === "type") {
      tipoPrompt = "select";
      opcionesSelect = [
        { title: "humanoide", value: "humanoide" },
        { title: "amorfo", value: "amorfo" },
        { title: "robótico", value: "robótico" },
        { title: "parásito", value: "parásito" },
        { title: "hivemind", value: "hivemind" },
      ];

      const indiceTipo = opcionesSelect.findIndex(
        (opcion: any) => opcion.value === valorInicial,
      );
      valorInicial = indiceTipo !== -1 ? indiceTipo : 0;
    } else if (menuEdicion.campo === "expectancy") {
      tipoPrompt = "number";
    }

    if (menuEdicion.campo === "origin") {
      const dimensiones = gestor.dimensiones.obtenerDimensiones();
      opcionesSelect = dimensiones.map((d) => ({
        title: `${d.name} (ID: ${d.id})`,
        value: d.name,
      }));
      tipoPrompt = "select";

      const indiceEstado = opcionesSelect.findIndex(
        (opcion: any) => opcion.value === valorInicial,
      );
      valorInicial = indiceEstado !== -1 ? indiceEstado : 0;
    }

    const { nuevoValor } = await prompts({
      type: tipoPrompt,
      name: "nuevoValor",
      message: `Introduce el nuevo valor para ${menuEdicion.campo}:`,
      initial: valorInicial,
      choices: opcionesSelect,
      min: menuEdicion.campo === "expectancy" ? 0 : undefined,
      max: menuEdicion.campo === "expectancy" ? 10000 : undefined,
    });

    if (nuevoValor !== undefined) {
      (copiaEspecie as any)[menuEdicion.campo] = nuevoValor;
    }
  }
}

import prompts from "prompts";
import { GestorMultiverso } from "../gestor/gestor.js";

/**
 * Función para pausar la ejecución y esperar al usuario.
 */
async function pausar(): Promise<void> {
  await prompts({
    type: "invisible",
    name: "p",
    message: "Presiona Enter para continuar...",
  });
}

/**
 * Menu de gestión de viajes
 * @param gestorViajes - Instancia del gestor para poder interactuar con la base de datos
 */
export async function menuEventos(
  gestorEventos: GestorMultiverso,
): Promise<void> {
  let volver: boolean = false;
  console.clear();
  while (!volver) {
    console.clear();

    const respuesta = await prompts<"accion">({
      type: "select",
      name: "accion",
      message: "--- GESTIÓN DE EVENTOS ---\n¿Qué operación deseas realizar?",
      choices: [
        { title: "Añadir evento", value: "add" },
        { title: "Eliminar evento", value: "delete" },
        { title: "Volver al menú principal", value: "back" },
      ],
    });
    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case "add":
        await flujoAñadirEvento(gestorEventos);
        await pausar();
        break;
      case "delete":
        await flujoEliminarEvento(gestorEventos);
        await pausar();
        break;
      case "consult":
        await flujoConsultarEventos(gestorEventos);
        await pausar();
        break;
      case "back":
        volver = true;
        break;
    }
  }
}

async function flujoAñadirEvento(gestorEventos: GestorMultiverso): Promise<void> {
  console.log("\n--- 🚀 DESPLEGAR ARTEFACTO EN LOCALIZACIÓN ---");

  //  Pedimos los datos al usuario
  const datos = await prompts([
    {
      type: 'text',
      name: 'artefactoId',
      message: 'Introduce el ID del Artefacto/Invento a desplegar:',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },
    {
      type: 'text',
      name: 'localizacionId',
      message: 'Introduce el ID de la Localización de destino:',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },

  ]);

  if (!datos.artefactoId || !datos.localizacionId) return;

  try {
    await gestorEventos.eventos.desplegarArtefacto(datos.artefactoId, datos.localizacionId);
    console.log(`\nÉxito! El artefacto ha sido desplegado y el evento ha quedado registrado en la bitácora.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`\nERROR DEL SISTEMA --> ${error.message} \n`);
    } else {
      console.log(`\n ERROR DESCONOCIDO --> ${String(error)} \n`);
    }
  }
}

async function flujoEliminarEvento(gestorEventos: GestorMultiverso): Promise<void> {
  console.log("\n--- ELIMINAR EVENTO ---");
  const eventos = gestorEventos.eventos.consultarEventos();

  if (eventos.length === 0) {
    console.log("No hay eventos registrados para eliminar.");
    return;
  }

  const respuesta = await prompts({
    type: "select",
    name: "eventoId",
    message: "Selecciona el evento que deseas eliminar:",
    choices: eventos.map((e) => ({
      title: `ID: ${e.id} | Artefacto: ${e.artefactoId} | Localización: ${e.localizacionId}`,
      value: e.id,
    })),
  });

  if (!respuesta.eventoId) return;

  try {
    await gestorEventos.eventos.eliminarEvento(respuesta.eventoId);
    console.log("\nEvento eliminado correctamente.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(`\nERROR DEL SISTEMA --> ${error.message} \n`);
    } else {
      console.log(`\n ERROR DESCONOCIDO --> ${String(error)} \n`);
    }
  }
}

async function flujoConsultarEventos(gestorEventos: GestorMultiverso): Promise<void> {
  console.log("\n--- LISTA DE EVENTOS REGISTRADOS ---");
  const eventos = gestorEventos.eventos.consultarEventos();

  if (eventos.length === 0) {
    console.log("No hay eventos registrados.");
    return;
  }

  eventos.forEach((e) => {
    console.log(`ID: ${e.id} | Artefacto: ${e.artefactoId} | Localización: ${e.localizacionId}`);
  });
}



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
export async function menuViajes(
  gestorViajes: GestorMultiverso,
): Promise<void> {
  let volver: boolean = false;
  console.clear();
  while (!volver) {
    console.clear();

    const respuesta = await prompts<"accion">({
      type: "select",
      name: "accion",
      message: "--- GESTIÓN DE VIAJES ---\n¿Qué operación deseas realizar?",
      choices: [
        { title: "Añadir viaje", value: "add" },
        { title: "Eliminar viaje", value: "delete" },
        { title: "Consultar viajes", value: "consult" },
        { title: "Informe de viajes por viajero", value: "informe" },
        { title: "Volver al menú principal", value: "back" },
      ],
    });
    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case "add":
        await flujoAñadirViaje(gestorViajes);
        await pausar();
        break;
      case "delete":
        await flujoEliminarViaje(gestorViajes);
        await pausar();
        break;
      case "consult":
        await flujoConsultarViajes(gestorViajes);
        await pausar();
        break;
      case "informe":
        await flujoInformeViajesPorViajero(gestorViajes);
        await pausar();
        break;
      case "back":
        volver = true;
        break;
    }
  }
}

/**
 * Flujo para añadir un nuevo viaje
 * @param gestorViajes - Instancia del gestor para poder interactuar con la base de datos
 */
async function flujoAñadirViaje(gestorViajes: GestorMultiverso): Promise<void> {
  console.log("--- AÑADIR VIAJE ---");
  const datos = await prompts([
    {
      type: "text",
      name: "id",
      message: "ID del viaje:",
    },
    {
      type: "select",
      name: "originId",
      message: "Dimensión de origen: ",
      choices: gestorViajes.dimensiones.obtenerDimensiones().map((d) => ({
        title: `${d.name} (${d.id})`,
        value: d.id,
      })),
    },
    {
      type: "select",
      name: "destinationId",
      message: "Dimensión de destino: ",
      choices: gestorViajes.dimensiones.obtenerDimensiones().map((d) => ({
        title: `${d.name} (${d.id})`,
        value: d.id,
      })),
    },
    {
      type: "select",
      name: "travelerId",
      message: "Viajero: ",
      choices: gestorViajes.personajes.obtenerPersonajes().map((v) => ({
        title: `${v.name} (${v.id})`,
        value: v.id,
      })),
    },
    {
      type: "text",
      name: "date",
      message: "Fecha del viaje (YYYY-MM-DD):",
      /** Hace la validación del formato de fecha */
      validate: (v) =>
        /^\d{4}-\d{2}-\d{2}$/.test(v) ? true : "Formato de fecha inválido.",
    },
    {
      type: "text",
      name: "motive",
      message: "Motivo del viaje:",
    },
  ]);

  if (
    !datos.id ||
    !datos.originId ||
    !datos.destinationId ||
    !datos.travelerId ||
    !datos.date ||
    !datos.motive
  ) {
    console.log("Todos los campos son obligatorios. Operación cancelada.");
    return;
  }

  /** Búsqueda del viajero */
  const viajero = gestorViajes.personajes
    .obtenerPersonajes()
    .find((p) => p.id === datos.travelerId);
  if (!viajero) {
    console.log(
      `El viajero con ID ${datos.travelerId} no existe. Operación cancelada.`,
    );
    return;
  }

  /** Búsqueda de la dimensión de origen */
  const dimensionOrigen = gestorViajes.dimensiones
    .obtenerDimensiones()
    .find((d) => d.id === datos.originId);
  if (!dimensionOrigen) {
    console.log(
      `La dimensión de origen con ID ${datos.originId} no existe. Operación cancelada.`,
    );
    return;
  }

  /** Búsqueda de la dimensión de destino */
  const dimensionDestino = gestorViajes.dimensiones
    .obtenerDimensiones()
    .find((d) => d.id === datos.destinationId);
  if (!dimensionDestino) {
    console.log(
      `La dimensión de destino con ID ${datos.destinationId} no existe. Operación cancelada.`,
    );
    return;
  }

  /** Creación del viaje */
  await gestorViajes.viajes.agregarViaje({
    id: datos.id,
    traveler: viajero,
    origin: dimensionOrigen,
    destination: dimensionDestino,
    date: new Date(datos.date),
    motive: datos.motive,
  });
  console.log("Viaje agregado exitosamente.");
}

/**
 * Flujo para eliminar un viaje existente
 * @param gestor - Instancia del gestor para poder interactuar con la base de datos
 */
async function flujoEliminarViaje(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- ELIMINAR VIAJE ---");
  const viajes = gestor.viajes.obtenerViajes();
  if (viajes.length === 0) {
    console.log("\nNo hay viajes registrados en el multiverso.");
    return;
  }

  const respuesta = await prompts({
    type: "select",
    name: "id",
    message: "Selecciona el viaje que deseas eliminar:",
    choices: viajes.map((v) => ({
      title: `${v.traveler.name} - ${v.origin.name} a ${v.destination.name} (ID: ${v.id})`,
      value: v.id,
    })),
  });

  if (!respuesta.id) {
    console.log("\n-Operación cancelada.-");
    return;
  }

  await gestor.viajes.eliminarViaje(respuesta.id);
  console.log("\n¡Viaje eliminado exitosamente!");
}

/**
 * Función para eliminar un viaje de la db
 * @param gestor - Instancia del gestor para poder interactuar con la base de datos
 */
async function flujoConsultarViajes(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- LISTA DE VIAJES ---");
  const viajes = gestor.viajes.obtenerViajes();
  if (viajes.length === 0) {
    console.log("\nNo hay viajes registrados en el multiverso.");
    return;
  }
  console.table(
    viajes.map((v) => ({
      ID: v.id,
      Viajero: v.traveler.name,
      Origen: v.origin.name,
      Destino: v.destination.name,
      Fecha: v.date.toString().split("T")[0],
      Motivo: v.motive,
    })),
  );
}

/**
 * Creación de un informe que muestre el historial de viajes de un viajero.
 * @param gestor - Instancia del gestor para poder interactuar con la base de datos
 * @returns 
 */
async function flujoInformeViajesPorViajero(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- INFORME DE VIAJES POR VIAJERO ---");
  const viajeros = gestor.personajes.obtenerPersonajes();
  if (viajeros.length === 0) {
    console.log("\nNo hay viajeros registrados en el multiverso.");
    return;
  }

  /** Selección del viajero */
  const respuesta = await prompts({
    type: "select",
    name: "travelerId",
    message: "Selecciona el viajero para consultar su historial de viajes:",
    choices: viajeros.map((v) => ({
      title: `${v.name} (ID: ${v.id})`,
      value: v.id,
    })),
  });

  if (!respuesta.travelerId) {
    console.log("\n-Operación cancelada.-");
    return;
  }

  console.log(`\n--- HISTORIAL DE VIAJES DEL VIAJERO ${respuesta.travelerId} ---\n`);
  const informe = gestor.viajes.obtenerHistorialViajesPorViajero(respuesta.travelerId);
  if (informe.length === 0) {
    console.log(`No se encontraron viajes para el viajero con ID ${respuesta.travelerId}.`);
    return;
  }
  informe.forEach((linea) => console.log(linea));
}
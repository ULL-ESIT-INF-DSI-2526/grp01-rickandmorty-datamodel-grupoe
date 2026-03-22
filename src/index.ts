import prompts from "prompts";
import { menuPersonajes } from "./menus/personajes.js";
import { menuDimensiones } from "./menus/dimensiones.js";
import { menuEspecies } from "./menus/especies.js";
import { menuLocalizaciones } from "./menus/localizaciones.js";
import { menuInventos } from "./menus/inventos.js";
import { menuViajes } from "./menus/viajes.js";
import { menuAlteraciones } from "./menus/alteraciones.js";

import { db } from "./database/db.js";
import { GestorMultiverso } from "./gestor/gestor.js";

/**
 * Función auxiliar que devuelve una Promesa vacía. Se utiliza para pausar la ejecución
 * y esperar a que el usuario presione Enter antes de continuar, lo que permite leer mensajes en pantalla.
 */
export async function pausar(): Promise<void> {
  await prompts({
    type: "invisible",
    name: "pausa",
    message: "Presiona Enter para continuar...",
  });
}

/**
* Funcion que muestra el menú principal del sistema y permite navegar a los diferentes submenús
*/
export async function menuPrincipal(): Promise<void> {
  const gestor = new GestorMultiverso(db);

  let salir: boolean = false;

  while (!salir) {
    console.clear();

    /** Podemos definir el tipo de la respuesta esperada */
    const respuesta = await prompts<"opcion">({
      type: "select",
      name: "opcion",
      message:
        "--- SISTEMA DE GESTIÓN MULTIVERSAL ---\nSelecciona una entidad para gestionar:",
      choices: [
        { title: "Personajes", value: "personajes" },
        { title: "Dimensiones", value: "dimensiones" },
        { title: "Especies", value: "especies" },
        { title: "Localizaciones", value: "localizaciones" },
        { title: "Inventos", value: "inventos" },
        { title: "Viajes", value: "viajes" },
        { title: "Alteraciones Dimensionales", value: "alteraciones" },
        { title: "Salir del sistema", value: "salir" },
      ],
    });

    if (!respuesta.opcion) {
      console.log("\nSaliendo de forma forzada...");
      process.exit(0);
    }

    switch (respuesta.opcion) {
      case "personajes":
        await menuPersonajes(gestor); /* Pasamos el gestor al menú de personajes para que pueda interactuar con la base de datos */
        await pausar(); /* Pausamos después de volver del menú para que el usuario pueda leer cualquier mensaje antes de limpiar la consola */
        break;
      case "dimensiones":
        await menuDimensiones(gestor);
        await pausar();
        break;
      case "especies":
        await menuEspecies(gestor);
        await pausar();
        break;
      case "localizaciones":
        await menuLocalizaciones(gestor);
        await pausar();
        break;
      case "inventos":
        await menuInventos(gestor);
        await pausar();
        break;
      case "viajes":
        await menuViajes(gestor);
        await pausar();
        break;
      case "alteraciones":
        await menuAlteraciones(gestor);
        await pausar();
        break;
      case "salir":
        salir = true;
        console.log("\nApagando el sistema. ¡Hasta pronto!");
        break;
    }
  }
}

menuPrincipal();

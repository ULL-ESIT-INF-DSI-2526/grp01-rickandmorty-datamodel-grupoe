import prompts from "prompts";
import { GestorMultiverso } from "../gestor/gestor.js";

async function pausar(): Promise<void> {
  await prompts({
    type: "invisible",
    name: "p",
    message: "Presiona Enter para continuar...",
  });
}

export async function menuInformes(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
    console.clear();

    const respuesta = await prompts<"accion">({
      type: "select",
      name: "accion",
      message: "--- GESTIÓN DE INFORMES ---\n¿Qué operación deseas realizar?",
      choices: [
        { title: "Dimensiones activas con nivel tecnológico medio", value: "dim" },
        { title: "Personajes con más versiones alternativas", value: "pers" },
        { title: "Inventos más peligrosos y su localización", value: "inv" },
        { title: "Volver al menú principal", value: "back" },
      ],
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case "dim":
        await flujoDimensionesActivas(gestor);
        await pausar();
        break;
      case "pers":
        // await flujoPersonajesAlternativas(gestor);
        await pausar();
        break;
      case "inv":
        // await flujoInventosPeligrosos(gestor);
        await pausar();
        break;
      case "back":
        volver = true;
        break;
    }
  }
}

/**
 * Funcion para mostrar un informe de las dimensiones activas con su nivel tecnológico medio
 * @param gestor - Instancia del gestor para acceder a los datos y generar el informe
 * @returns Retornamos una tabla con el informe realizado
 */
async function flujoDimensionesActivas(gestor: GestorMultiverso): Promise<void> {
  console.log("\n--- DIMENSIONES ACTIVAS CON NIVEL TECNOLÓGICO MEDIO ---");
  const informe = gestor.informes.listarDimensionesActivas();

  if (informe.dimensiones.length === 0) {
    console.log("\nNo hay dimensiones activas registradas en el multiverso.");
    return;
  }

  console.log(`\n> Nivel Tecnológico Medio: ${informe.media.toFixed(2)} \n`);

  console.table(
    informe.dimensiones.map((d) => ({
      "ID": d.id,
      "Nombre": d.name, 
      "Nivel Tecnológico": d.nivelTecnolog,
      "Estado": d.state
    }))
  );
}




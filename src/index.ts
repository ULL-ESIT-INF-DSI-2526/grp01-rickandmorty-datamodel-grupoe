import prompts from 'prompts';
import { menuPersonajes } from './menus/personajes.js';
import { menuDimensiones } from './menus/dimensiones.js';
// import { menuEspecies } from './menus/especies.js';
// import { menuLocalizaciones } from './menus/localizaciones.js';
// import { menuInventos } from './menus/inventos.js';

import { db } from './database/db.js'; 
import { GestorMultiverso } from './gestor/gestor.js';



// Función auxiliar tipada que devuelve una Promesa vacía
async function pausar(): Promise<void> {
  await prompts({ 
    type: 'invisible', 
    name: 'pausa', 
    message: 'Presiona Enter para continuar...' 
  });
}

async function menuPrincipal(): Promise<void> {
  const gestor = new GestorMultiverso(db); // Creamos una instancia del gestor pasando la base de datos

  let salir: boolean = false;

  while (!salir) {
    console.clear();
    
    // Podemos definir el tipo de la respuesta esperada
    const respuesta = await prompts<'opcion'>({
      type: 'select',
      name: 'opcion',
      message: '--- SISTEMA DE GESTIÓN MULTIVERSAL ---\nSelecciona una entidad para gestionar:',
      choices: [
        { title: 'Personajes', value: 'personajes' },
        { title: 'Dimensiones', value: 'dimensiones' },
        { title: 'Especies', value: 'especies' },
        { title: 'Localizaciones', value: 'localizaciones' },
        { title: 'Inventos', value: 'inventos' },
        { title: 'Salir del sistema', value: 'salir' }
      ]
    });

    if (!respuesta.opcion) {
      console.log('\nSaliendo de forma forzada...');
      process.exit(0);
    }

    switch (respuesta.opcion) {
      case 'personajes':
        await menuPersonajes(gestor); // Pasamos el gestor al menú de personajes para que pueda interactuar con la base de datos
        await pausar();
        break;
      case 'dimensiones':
        await menuDimensiones(gestor); // Aquí cargarías el menú de dimensiones, pasando el gestor
        await pausar(); // Pausamos después de volver del menú para que el usuario pueda leer cualquier mensaje antes de limpiar la consola
        break;
      // ... (resto de casos)
      case 'salir':
        salir = true;
        console.log('\nApagando el sistema. ¡Hasta pronto!');
        break;
    }
  }
}

menuPrincipal();
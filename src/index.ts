import prompts from 'prompts';
import { menuPersonajes } from './menus/personajes.js';
// Importar el resto de menús...

// Función auxiliar tipada que devuelve una Promesa vacía
async function pausar(): Promise<void> {
  await prompts({ 
    type: 'invisible', 
    name: 'pausa', 
    message: 'Presiona Enter para continuar...' 
  });
}

async function menuPrincipal(): Promise<void> {
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
        await menuPersonajes();
        break;
      case 'dimensiones':
        console.log('\n[TODO: Cargar menú de dimensiones]');
        await pausar();
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
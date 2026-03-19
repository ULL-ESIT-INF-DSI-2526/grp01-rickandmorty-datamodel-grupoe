import prompts from 'prompts';
import { Species } from '../interfaces/species.js';
import { GestorMultiverso } from '../gestor/gestor.js';


async function pausar(): Promise<void> {
  await prompts({ type: 'invisible', name: 'p', message: 'Presiona Enter para continuar...' });
}

export async function menuEspecies(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
  console.clear();
    
    const respuesta = await prompts<'accion'>({
      type: 'select',
      name: 'accion',
      message: '--- GESTIÓN DE ESPECIES ---\n¿Qué operación deseas realizar?',
      choices: [
        { title: 'Añadir especie', value: 'add' },
        { title: 'Eliminar especie', value: 'delete' },
        { title: 'Modificar especie', value: 'update' },
        { title: 'Volver al menú principal', value: 'back' }
      ]
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case 'add':
        await flujoAñadirEspecie(gestor);
        await pausar();
        break;
      case 'delete':
        await flujoEliminarEspecie(gestor);
        await pausar();
        break;
      case 'update':
        console.log('\n[TODO: Modificar especie]');
        await pausar();
        break;
      case 'back':
        volver = true;
        break;
    }
  }
}

/**
 * Flujo interactivo para pedir los datos y crear un nueva especie.
 */
async function flujoAñadirEspecie(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- REGISTRO DE LA NUEVA ESPECIE ---');
  // Asegurarse que los name sean igual que lo de las interfaces para que no de fallos al pasarlo al tipo de datos del Species
  const datos = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'ID de la especie (Ej: sp-1):',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },
    {
      type: 'text',
      name: 'name', 
      message: 'Nombre de la especie:'
    },
    {
      type: 'text',
      name: 'origin',
      message: 'Planeta o dimension donde surgio la especie:'
    },
    {
      type: 'select',
      name: 'type',
      message: 'Clasificación de tipo de especie:',
      choices: [
        { title: 'humanoide', value: 'humanoide' },
        { title: 'amorfo', value: 'amorfo' },
        { title: 'robótico', value: 'robótico' },
        { title: 'parásito', value: 'parásito' },
        { title: 'hivemind', value: 'hivemind' }
      ]
    },
    {
      type: 'number',
      name: 'expectancy',
      message: 'Esperanza de vida en años:',
      min: 0,
      max: 10000
    },
    {
      type: 'text',
      name: 'description',
      message: 'Breve descripción:'
    }
  ]);

  // Si el usuario cancela a mitad de las preguntas (Ctrl+C)
  if (!datos.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  try {
    // Forzamos el tipado a Character
    const nuevaEspecie = datos as Species;
    // Llamamos a la función del gestor, que hará las comprobaciones de necesarios para ver si el personaje es válido
    await gestor.especies.agregarEspecie(nuevaEspecie);
    // Si todo va bien
    console.log(`\n ¡Éxito! La especie ${nuevaEspecie.name} ha sido añadida al multiverso.`);
  } catch (error: any) {
    // Si se intorudce una dimensión que no existe o un dato incorrecto, el error se mostrará aquí 
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Funcion para eliminar una especie de la db
 */
async function flujoEliminarEspecie(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- ELIMINAR ESPECIE ---');
  const especies = gestor.especies.obtenerEspecies();
  if (especies.length === 0) {
    console.log('\nNo hay especies registradas en el multiverso.');
    return;
  }

  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la especie que deseas eliminar:',
    choices: especies.map(e => ({ title: `${e.name} (ID: ${e.id})`, value: e.id }))
  });
  
  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  try {
    await gestor.especies.eliminarEspecie(respuesta.id);
    console.log('\n¡Especie eliminada exitosamente!');
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}
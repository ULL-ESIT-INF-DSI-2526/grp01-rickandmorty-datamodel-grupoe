import prompts from 'prompts';
import { Character } from '../interfaces/character.js';
import { GestorMultiverso } from '../gestor/gestor.js';


async function pausar(): Promise<void> {
  await prompts({ type: 'invisible', name: 'p', message: 'Presiona Enter para continuar...' });
}


export async function menuPersonajes(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
  console.clear();
    
    const respuesta = await prompts<'accion'>({
      type: 'select',
      name: 'accion',
      message: '--- GESTIÓN DE PERSONAJES ---\n¿Qué operación deseas realizar?',
      choices: [
        { title: 'Añadir personaje', value: 'add' },
        { title: 'Eliminar personaje', value: 'delete' },
        { title: 'Modificar personaje', value: 'update' },
        { title: 'Consultar y ordenar personajes', value: 'consult' },
        { title: 'Buscar versiones alternativas', value: 'alternates' },
        { title: 'Volver al menú principal', value: 'back' }
      ]
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case 'add':
        console.log('\n[TODO: Añadir personaje]');
        await pausar();
        await flujoAñadirPersonaje(gestor);
        await pausar();
        break;
      case 'delete':
        console.log('\n[TODO: Eliminar personaje]');
        await pausar();
        await flujoEliminarPersonaje(gestor);
        await pausar();
        break;
      case 'update':
        console.log('\n[TODO: Modificar personaje]');
        await pausar();
        break;
      case 'consult':
        console.log('\n[TODO: Consultar y ordenar personajes]');
        await pausar();
        break;
      case 'alternates':
        console.log('\n[TODO: Buscar versiones alternativas]');
        await pausar();
        break;
      case 'back':
        volver = true;
        break;
    }
  }
}

/**
 * Flujo interactivo para pedir los datos y crear un nuevo personaje.
 */
async function flujoAñadirPersonaje(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- REGISTRO DEL NUEVO PERSONAJE ---');
  // Asegurarse que los name sean igual que lo de las interfaces para que no de fallos al pasarlo al tipo de datos del Character
  const datos = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'ID del personaje (Ej: P-137):',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },
    {
      type: 'text',
      name: 'name', 
      message: 'Nombre del personaje:'
    },
    {
      type: 'text',
      name: 'speciesId',
      message: 'ID de su especie (Ej: E-01):'
    },
    {
      type: 'text',
      name: 'dimensionId',
      message: 'ID de su dimensión de origen (Ej: C-137):'
    },
    {
      type: 'select',
      name: 'state',
      message: 'Estado vital:',
      choices: [
        { title: 'vivo', value: 'vivo' },
        { title: 'muerto', value: 'muerto' },
        { title: 'desconocido', value: 'desconocido' },
        { title: 'Robot-sustituto', value: 'robor' }
      ]
    },
    {
      type: 'text',
      name: 'affiliation',
      message: 'Afiliación (Ej: Familia Smith, Independiente):'
    },
    {
      type: 'number',
      name: 'nivelIntelligence',
      message: 'Nivel de inteligencia (1-10):',
      min: 1,
      max: 10
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
    const nuevoPersonaje = datos as Character;
    // Llamamos a la función del gestor, que hará las comprobaciones de necesarios para ver si el personaje es válido
    await gestor.personajes.agregarPersonaje(nuevoPersonaje);
    // Si todo va bien
    console.log(`\n ¡Éxito! El personaje ${nuevoPersonaje.name} ha sido añadido al multiverso.`);
  } catch (error: any) {
    // Si se intorudce una dimensión que no existe o un dato incorrecto, el error se mostrará aquí 
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Funcion para eliminar un personaje de la db
 */
async function flujoEliminarPersonaje(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- ELIMINAR PERSONAJE ---');
  const personajes = gestor.personajes.obtenerPersonajes();
  if (personajes.length === 0) {
    console.log('\nNo hay personajes registrados en el multiverso.');
    return;
  }

  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona el personaje que deseas eliminar:',
    choices: personajes.map(p => ({ title: `${p.name} (ID: ${p.id})`, value: p.id }))
  });
  
  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  try {
    await gestor.personajes.eliminarPersonaje(respuesta.id);
    console.log('\n¡Personaje eliminado exitosamente!');
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}
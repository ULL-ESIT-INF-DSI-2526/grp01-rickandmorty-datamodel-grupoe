import prompts from 'prompts';
import { Dimension } from '../interfaces/dimension.js';
import { GestorMultiverso } from '../gestor/gestor.js';

async function pausar(): Promise<void> {
  await prompts({ type: 'invisible', name: 'p', message: 'Presiona Enter para continuar...' });
}

export async function menuDimensiones(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
  console.clear();
    
    const respuesta = await prompts<'accion'>({
      type: 'select',
      name: 'accion',
      message: '--- GESTIÓN DE DIMENSIONES ---\n¿Qué operación deseas realizar?',
      choices: [
        { title: 'Añadir dimensión', value: 'add' },
        { title: 'Eliminar dimensión', value: 'delete' },
        { title: 'Modificar dimensión', value: 'update' },
        { title: 'Volver al menú principal', value: 'back' }
      ]
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case 'add':
        await flujoAñadirDimension(gestor);
        await pausar();
        break;
      case 'delete':
        await flujoEliminarDimension(gestor);
        await pausar();
        break;
      case 'update':
        console.log('\n[TODO: Modificar dimensión]');
        await pausar();
        break;
      case 'back':
        volver = true;
        break;
    }
  }
}

/**
 * Flujo interactivo para pedir los datos y crear una nueva dimension.
 */
async function flujoAñadirDimension(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- REGISTRO DE LA NUEVA DIMENSIÓN ---');
  // Asegurarse que los name sean igual que lo de las interfaces para que no de fallos al pasarlo al tipo de datos del Character
  const datos = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'ID de la dimension (Ej: D-99):',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },
    {
      type: 'text',
      name: 'name', 
      message: 'Nombre de la dimension:'
    },
    {
      type: 'select',
      name: 'state',
      message: 'Estado de la dimension:',
      choices: [
        { title: 'activa', value: 'activa' },
        { title: 'destruida', value: 'destruida' },
        { title: 'cuarentena', value: 'cuarentena' }
      ]
    },
    {
      type: 'number',
      name: 'nivelTecnolog',
      message: 'Nivel de tecnología (1-10):',
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
    // Forzamos el tipado a Dimension
    const nuevaDimension = datos as Dimension;
    // Llamamos a la función del gestor, que hará las comprobaciones de necesarios para ver si la dimensión es válida
    await gestor.dimensiones.agregarDimension(nuevaDimension);
    // Si todo va bien
    console.log(`\n ¡Éxito! La nueva dimension: ${nuevaDimension.name} ha sido añadido al multiverso.`);
  } catch (error: any) {
    // Si se intorudce una dimensión que no existe o un dato incorrecto, el error se mostrará aquí 
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Funcion para eliminar una dimension de la db
 */
async function flujoEliminarDimension(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- ELIMINAR DIMENSION ---');
  const dimensiones = gestor.dimensiones.obtenerDimensiones();
  if (dimensiones.length === 0) {
    console.log('\nNo hay dimensiones registradas en el multiverso.');
    return;
  }

  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la dimension que deseas eliminar:',
    choices: dimensiones.map(p => ({ title: `${p.name} (ID: ${p.id})`, value: p.id }))
  });
  
  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  try {
    await gestor.dimensiones.eliminarDimension(respuesta.id);
    console.log('\nDimension eliminada exitosamente!');
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}
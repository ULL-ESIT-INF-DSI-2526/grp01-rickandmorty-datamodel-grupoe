import prompts from 'prompts';
import { Invention } from '../interfaces/invention.js';
import { GestorMultiverso } from '../gestor/gestor.js';


async function pausar(): Promise<void> {
  await prompts({ type: 'invisible', name: 'p', message: 'Presiona Enter para continuar...' });
}

export async function menuInventos(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
  console.clear();
    
    const respuesta = await prompts<'accion'>({
      type: 'select',
      name: 'accion',
      message: '--- GESTIÓN DE INVENVIONES ---\n¿Qué operación deseas realizar?',
      choices: [
        { title: 'Añadir invento', value: 'add' },
        { title: 'Eliminar invento', value: 'delete' },
        { title: 'Modificar invento', value: 'update' },
        { title: 'Consultar inventos', value: 'consult' },
        { title: 'Volver al menú principal', value: 'back' }
      ]
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case 'add':
        await flujoAñadirInvento(gestor);
        await pausar();
        break;
      case 'delete':
        await flujoEliminarInvento(gestor);
        await pausar();
        break;
      case 'update':
        await flujoModificarInvento(gestor);
        await pausar();
        break;
      case 'consult':
        console.log('\n[TODO: Consultar inventos]');
        await pausar();
        break;
      case 'back':
        volver = true;
        break;
    }
  }
}

/**
 * Flujo interactivo para pedir los datos y crear un nuevo invento.
 */
async function flujoAñadirInvento(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- REGISTRO DEL NUEVO INVENCION ---');
  // Asegurarse que los name sean igual que lo de las interfaces para que no de fallos al pasarlo al tipo de datos del Invention
  const datos = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'ID del invento (Ej: I-1):',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },
    {
      type: 'text',
      name: 'name', 
      message: 'Nombre del invento:'
    },
    {
      type: 'text',
      name: 'inventorId',
      message: 'Referencia al personaje que lo invento con su ID:'
    },
    {
      type: 'text',
      name: 'type',
      message: 'Tipo de invento:',
    },
    {
      type: 'number',
      name: 'nivelDanger',
      message: 'Nivel de peligro (1-10):',
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
    const nuevoInvento = datos as Invention;
    
    // Llamamos a la función del gestor, que hará las comprobaciones de necesarios para ver si el personaje es válido
    await gestor.inventos.agregarInvento(nuevoInvento);
    // Si todo va bien
    console.log(`\n ¡Éxito! El invento ${nuevoInvento.name} ha sido añadida al multiverso.`);
  } catch (error: any) {
    // Si se intorudce una dimensión que no existe o un dato incorrecto, el error se mostrará aquí 
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Funcion para eliminar una especie de la db
 */
async function flujoEliminarInvento(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- ELIMINAR ESPECIE ---');
  const inventos = gestor.inventos.obtenerInventos();
  if (inventos.length === 0) {
    console.log('\nNo hay inventos registradas en el multiverso.');
    return;
  }

  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona el invento que deseas eliminar:',
    choices: inventos.map(e => ({ title: `${e.name} (ID: ${e.id})`, value: e.id }))
  });
  
  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  try {
    await gestor.inventos.eliminarInvento(respuesta.id);
    console.log('\n¡Invento eliminado exitosamente!');
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

async function flujoModificarInvento(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- MODIFICAR ESPECIE ---');
  const inventos = gestor.inventos.obtenerInventos();
  if (inventos.length === 0) {
    console.log('\nNo hay inventos registradas en el multiverso.');
    return;
  }

  const respuesta = await prompts({
      type: 'select',
      name: 'id',
      message: 'Selecciona el invento que deseas modificar:',
      choices: inventos.map(i => ({ title: `${i.name} (ID: ${i.id})`, value: i.id }))
    });

    if (!respuesta.id) {
      console.log('\n-Operación cancelada.-');
      return;
    }

    const inventoSeleccionado = inventos.find(i => i.id === respuesta.id);
    let copia = { ...inventoSeleccionado };
    let edit = true;

    while (edit) {
      console.clear();
      console.log(`--- MODIFICAR INVENTO: ---`);
      console.log('Datos actuales que se van a guardar:');
      console.table(copia);
      console.log('--------------------------\n');

      const menuEdit = await prompts({
            type: 'select',
            name: 'campo',
            message: '¿Qué campo deseas modificar?',
            choices: [
              { title: 'Nombre', value: 'name' },
              { title: 'Inventor (ID)', value: 'inventorId' },
              { title: 'Tipo', value: 'type' },
              { title: 'Nivel de peligro', value: 'nivelDanger' },
              { title: 'Descripción', value: 'description' },
              { title: 'Guardar cambios y salir', value: 'save' },
              { title: 'Salir sin guardar', value: 'exit' }
            ]
          });

      if (!menuEdit.campo || menuEdit.campo === 'exit') {
        console.log('\n-Operación cancelada.-');
        return;
      }

      if (menuEdit.campo === 'save') {
      try {
        await gestor.inventos.modificarInvento(respuesta.id, copia);
        console.log('\n¡Invento modificado exitosamente!');
      } catch (error: any) {
        console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
      }
      edit = false;
      continue;
    }

    let tipoPrompt: 'text' | 'number' | 'select' = 'text';
    let valorInicial: any = copia[menuEdit.campo as keyof Invention];
    
    if (menuEdit.campo === 'nivelDanger') {
      tipoPrompt = 'number';
    }

    const respuestaCampo = await prompts({
      type: tipoPrompt,
      name: 'valor',
      message: `Nuevo valor para ${menuEdit.campo}:`,
      initial: valorInicial,
      min: menuEdit.campo === 'nivelDanger' ? 1 : undefined,
      max: menuEdit.campo === 'nivelDanger' ? 10 : undefined,
    });

    if (respuestaCampo.valor !== undefined) {
      (copia as any)[menuEdit.campo] = respuestaCampo.valor;
    }
  }
}
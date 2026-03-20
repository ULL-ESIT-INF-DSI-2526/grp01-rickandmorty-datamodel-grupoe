import prompts from 'prompts';
import { Location } from '../interfaces/location.js';
import { GestorMultiverso } from '../gestor/gestor.js';


async function pausar(): Promise<void> {
  await prompts({ type: 'invisible', name: 'p', message: 'Presiona Enter para continuar...' });
}

export async function menuLocalizaciones(gestor: GestorMultiverso): Promise<void> {
  let volver: boolean = false;

  while (!volver) {
  console.clear();
    
    const respuesta = await prompts<'accion'>({
      type: 'select',
      name: 'accion',
      message: '--- GESTIÓN DE LOCALIZACIONES ---\n¿Qué operación deseas realizar?',
      choices: [
        { title: 'Añadir localización', value: 'add' },
        { title: 'Eliminar localización', value: 'delete' },
        { title: 'Modificar localización', value: 'update' },
        { title: 'Consultar localizaciones', value: 'consult' },
        { title: 'Volver al menú principal', value: 'back' }
      ]
    });

    if (!respuesta.accion) return;

    switch (respuesta.accion) {
      case 'add':
        await flujoAñadirLocalizacion(gestor);
        await pausar();
        break;
      case 'delete':
        await flujoEliminarLocalizacion(gestor);
        await pausar();
        break;
      case 'update':
        await flujoModificarLocalizacion(gestor);
        await pausar();
        break;
      case 'consult':
        console.log('\n[TODO: Consultar localizaciones]');
        await pausar();
        break;
      case 'back':
        volver = true;
        break;
    }
  }
}

/**
 * Flujo interactivo para pedir los datos y crear un nueva localización.
 */
async function flujoAñadirLocalizacion(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- REGISTRO DE LA NUEVA LOCALIZACIÓN ---');
  // Asegurarse que los name sean igual que lo de las interfaces para que no de fallos al pasarlo al tipo de datos del Location
  const datos = await prompts([
    {
      type: 'text',
      name: 'id',
      message: 'ID de la localización (Ej: loc-1):',
      validate: (v) => v.length > 0 ? true : 'El ID es obligatorio.'
    },
    {
      type: 'text',
      name: 'name', 
      message: 'Nombre de la localización:'
    },
    {
      type: 'text',
      name: 'type',
      message: 'Tipo de localización:'
    },
    {
      type: 'text',
      name: 'dimensionId',
      message: 'Referencia con la ID de la dimension en la que se encuentra:',
    },
    {
      type: 'number',
      name: 'population',
      message: 'Poblacion de la localizacion:',
      min: 0,
      max: 1000000000
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
    const nuevaLocalizacion = datos as Location;
    // Llamamos a la función del gestor, que hará las comprobaciones de necesarios para ver si el personaje es válido
    await gestor.localizaciones.agregarLocalizacion(nuevaLocalizacion);
    // Si todo va bien
    console.log(`\n ¡Éxito! La localización ${nuevaLocalizacion.name} ha sido añadida al multiverso.`);
  } catch (error: any) {
    // Si se intorudce una dimensión que no existe o un dato incorrecto, el error se mostrará aquí 
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

/**
 * Funcion para eliminar una localización de la db
 */
async function flujoEliminarLocalizacion(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- ELIMINAR LOCALIZACIÓN ---');
  const localizaciones = gestor.localizaciones.obtenerLocalizaciones();
  if (localizaciones.length === 0) {
    console.log('\nNo hay localizaciones registradas en el multiverso.');
    return;
  }

  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la localización que deseas eliminar:',
    choices: localizaciones.map(l => ({ title: `${l.name} (ID: ${l.id})`, value: l.id }))
  });
  
  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  try {
    await gestor.localizaciones.eliminarLocalizacion(respuesta.id);
    console.log('\n¡Localización eliminada exitosamente!');
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

async function flujoModificarLocalizacion(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- MODIFICAR LOCALIZACIÓN ---');
  const localizaciones = gestor.localizaciones.obtenerLocalizaciones();
  if (localizaciones.length === 0) {
    console.log('\nNo hay localizaciones registradas en el multiverso.');
    return;
  }
  
  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona la localización que deseas modificar:',
    choices: localizaciones.map(l => ({ title: `${l.name} (ID: ${l.id})`, value: l.id }))
  });

  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }

  // Copia de la localización original para modificarla
  const localizacionOriginal = localizaciones.find(l => l.id === respuesta.id);
  let copia = { ...localizacionOriginal };
  let edit = true;

  while (edit) {
    console.clear();
    console.log('--- MODIFICANDO LOCALIZACIÓN: ---');
    console.log('Datos actuales que se van a guardar:');
    console.table(copia);
    console.log('--------------------------\n');

    const menuEdit = await prompts({
      type: 'select',
      name: 'campo',
      message: '¿Qué campo deseas modificar?',
      choices: [
        { title: 'Nombre', value: 'name' },
        { title: 'Tipo', value: 'type' },
        { title: 'ID de dimensión', value: 'dimensionId' },
        { title: 'Población', value: 'population' },
        { title: 'Descripción', value: 'description' },
        { title: 'Guardar cambios y salir', value: 'save' },
        { title: 'Cancelar modificación', value: 'cancelar' }
      ]
    });

    if (!menuEdit.campo || menuEdit.campo === 'cancelar') {
      console.log('\nModificación descartada.');
      edit = false;
      continue;
    }

    if (menuEdit.campo === 'save') {
      try {
        await gestor.localizaciones.modificarLocalizacion(respuesta.id, copia);
        console.log('\n¡Localización modificada exitosamente!');
      } catch (error: any) {
        console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
      }
      edit = false;
      continue;
    }

    let tipoPrompt: 'text' | 'number' | 'select' = 'text';

    // Usamos keyof para el "noImplicitAny"
    let valorInicial: any = copia[menuEdit.campo as keyof Location];

    // Población positiva o cero
    if (menuEdit.campo === 'population') {
      tipoPrompt = 'number';
      valorInicial = (typeof valorInicial === 'number' && valorInicial >= 0) ? valorInicial : 0;
    }

    let opcionesDimension: { title: string; value: string }[] = [];

    if (menuEdit.campo === 'dimensionId') {
      const dimensiones = gestor.dimensiones.obtenerDimensiones();
      opcionesDimension = dimensiones.map(d => ({ title: `${d.name} (ID: ${d.id})`, value: d.id }));
      tipoPrompt = 'select';

      const indiceEstado = opcionesDimension.findIndex((opcion: any) => opcion.value === valorInicial);
      valorInicial = indiceEstado !== -1 ? indiceEstado : 0;
      }

    const respuestaCampo = await prompts({
      type: tipoPrompt,
      name: 'valor',
      message: `Nuevo valor para ${menuEdit.campo}:`,
      initial: valorInicial,
      choices: opcionesDimension.length > 0 ? opcionesDimension : undefined
    });
  
    if (respuestaCampo.valor !== undefined) {
      (copia as any)[menuEdit.campo] = respuestaCampo.valor; // Actualizamos la copia con el nuevo valor
    }  
    }
  }
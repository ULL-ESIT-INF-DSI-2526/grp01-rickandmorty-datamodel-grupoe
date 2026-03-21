import prompts from 'prompts';
import { Character, FiltroPersonajes, OrdenPersonajes } from '../interfaces/character.js';
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
        await flujoAñadirPersonaje(gestor);
        await pausar();
        break;
      case 'delete':
        await flujoEliminarPersonaje(gestor);
        await pausar();
        break;
      case 'update':
        await flujoModificarPersonaje(gestor);
        await pausar();
        break;
      case 'consult':
        await flujoConsultarPersonajes(gestor);
        await pausar();
        break;
      case 'alternates':
        await flujoLocalizarVersionesAlternativas(gestor);
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

/**
 * Flujo interactivo para seleccionar y modificar los campos de un personaje uno a uno.
 */
export async function flujoModificarPersonaje(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- MODIFICAR PERSONAJE ---');
  const personajes = gestor.personajes.obtenerPersonajes();
  
  if (personajes.length === 0) {
    console.log('\nNo hay personajes registrados en el multiverso.');
    return;
  }

  // Selección de personaje a modificar
  const respuestaId = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona el personaje que deseas modificar:',
    choices: personajes.map(p => ({ title: `${p.name} (ID: ${p.id})`, value: p.id }))
  });

  if (!respuestaId.id) return;

  // Creación de una copia temporal del personaje para no modificar el original
  const personajeOriginal = personajes.find(p => p.id === respuestaId.id)!;
  let copiaPersonaje = { ...personajeOriginal };
  let editando = true;

  // Bucle para mostrar el menú de edición hasta que el usuario decida guardar o cancelar
  while (editando) {
    console.clear();
    console.log('--- EDITANDO PERSONAJE ---');
    console.log('Datos actuales que se van a guardar:');
    console.table(copiaPersonaje);
    console.log('--------------------------\n');

    const menuEdicion = await prompts({
      type: 'select',
      name: 'campo',
      message: '¿Qué campo deseas modificar?',
      choices: [
        { title: '1. Nombre', value: 'name' },
        { title: '2. ID Especie', value: 'speciesId' },
        { title: '3. ID Dimensión', value: 'dimensionId' },
        { title: '4. Estado vital', value: 'state' },
        { title: '5. Afiliación', value: 'affiliation' },
        { title: '6. Nivel de Inteligencia', value: 'nivelIntelligence' },
        { title: '7. Descripción', value: 'description' },
        { title: '8. Guardar cambios y salir', value: 'guardar' },
        { title: '9. Descartar cambios y salir', value: 'cancelar' }
      ]
    });

    if (!menuEdicion.campo || menuEdicion.campo === 'cancelar') {
      console.log('\nModificación descartada.');
      editando = false;
      continue;
    }

    if (menuEdicion.campo === 'guardar') {
      try {
        await gestor.personajes.modificarPersonaje(respuestaId.id, copiaPersonaje);
        console.log('\n¡Personaje actualizado y guardado con éxito!');
      } catch (error: any) {
        console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
      }
      editando = false;
      continue;
    }

    // Dependiendo del campo seleccionado, el tipo de prompt puede variar (texto, número, selección)
    let tipoPrompt: 'text' | 'select' | 'number' = 'text';
    let opcionesSelect: any = undefined;
    
    // Obtenemos el valor actual que tiene el personaje en ese campo
    let valorInicial: any = copiaPersonaje[menuEdicion.campo as keyof Character];

    if (menuEdicion.campo === 'state') {
      tipoPrompt = 'select';
      opcionesSelect = [
        { title: 'vivo', value: 'vivo' },
        { title: 'muerto', value: 'muerto' },
        { title: 'desconocido', value: 'desconocido' },
        { title: 'Robot-sustituto', value: 'robot' }
      ];
      
      const indiceEstado = opcionesSelect.findIndex((opcion: any) => opcion.value === valorInicial);
      valorInicial = indiceEstado !== -1 ? indiceEstado : 0;

    } else if (menuEdicion.campo === 'nivelIntelligence') {
      tipoPrompt = 'number';
    }

    const { nuevoValor } = await prompts({
      type: tipoPrompt,
      name: 'nuevoValor',
      message: `Introduce el nuevo valor para ${menuEdicion.campo}:`,
      initial: valorInicial,
      choices: opcionesSelect,
      min: menuEdicion.campo === 'nivelIntelligence' ? 1 : undefined,
      max: menuEdicion.campo === 'nivelIntelligence' ? 10 : undefined
    });

    // Aplicar el cambio a la copia temporal
    if (nuevoValor !== undefined) {
      (copiaPersonaje as any)[menuEdicion.campo] = nuevoValor;
    }
  }
}

export async function flujoConsultarPersonajes(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- CONSULTAR Y ORDENAR PERSONAJES ---');

  const { campoFiltro } = await prompts({
    type: 'select',
    name: 'campoFiltro',
    message: '¿Por qué atributo deseas filtrar?',
    choices: [
      { title: 'Sin filtro (Mostrar todos)', value: 'ninguno' },
      { title: 'Nombre', value: 'name' },
      { title: 'Especie (ID)', value: 'speciesId' },
      { title: 'Dimensión (ID)', value: 'dimensionId' },
      { title: 'Estado vital', value: 'state' },
      { title: 'Afiliación', value: 'affiliation' }
    ]
  });

  if (!campoFiltro) return;

  let filtro: FiltroPersonajes | undefined = undefined;

  if (campoFiltro !== 'ninguno') {
    let tipoInput: any = 'text';
    let opciones = undefined;

    if (campoFiltro === 'state') {
      tipoInput = 'select';
      opciones = [
        { title: 'vivo', value: 'vivo' },
        { title: 'muerto', value: 'muerto' },
        { title: 'desconocido', value: 'desconocido' },
        { title: 'Robot-sustituto', value: 'robot' }
      ];
    }

    const { valorFiltro } = await prompts({
      type: tipoInput,
      name: 'valorFiltro',
      message: `Introduce el valor para buscar por ${campoFiltro}:`,
      choices: opciones
    });

    if (valorFiltro === undefined) return;
    filtro = { [campoFiltro]: valorFiltro };
  }

  const { campoOrden } = await prompts({
    type: 'select',
    name: 'campoOrden',
    message: '¿Cómo deseas ordenar los resultados?',
    choices: [
      { title: 'Sin ordenación', value: 'ninguno' },
      { title: 'Por Nombre', value: 'name' },
      { title: 'Por Inteligencia', value: 'nivelIntelligence' }
    ]
  });

  if (!campoOrden) return;

  let orden: OrdenPersonajes | undefined = undefined;

  if (campoOrden !== 'ninguno') {
    const { direccion } = await prompts({
      type: 'select',
      name: 'direccion',
      message: '¿En qué dirección?',
      choices: [
        { title: 'Ascendente', value: 'asc' },
        { title: 'Descendente', value: 'desc' }
      ]
    });

    if (!direccion) return;
    orden = { campo: campoOrden, direccion: direccion };
  }

  const resultados = gestor.personajes.consultarPersonajes(filtro, orden);

  console.log('\n--- RESULTADOS DE LA BÚSQUEDA ---');
  if (resultados.length === 0) {
    console.log('No se encontraron personajes con esos criterios.');
  } else {
    console.table(resultados, ['id', 'name', 'speciesId', 'dimensionId', 'state', 'nivelIntelligence', 'affiliation']);
  }
}

async function flujoLocalizarVersionesAlternativas(gestor: GestorMultiverso): Promise<void> {
  console.log('\n--- LOCALIZAR VERSIONES ALTERNATIVAS ---');

  const personajes = gestor.personajes.obtenerPersonajes();
  if (personajes.length === 0) {
    console.log('\nNo hay personajes registrados en el multiverso.');
    return;
  }

  const respuesta = await prompts({
    type: 'select',
    name: 'id',
    message: 'Selecciona el personaje para localizar sus versiones alternativas:',
    choices: personajes.map(p => ({ title: `${p.name} (ID: ${p.id})`, value: p.id }))
  });

  if (!respuesta.id) {
    console.log('\n-Operación cancelada.-');
    return;
  }


  try {    
    const versionesAlternativas = gestor.personajes.localizarVersionesAlternativas(respuesta.id);
    if (versionesAlternativas.length === 0) {
      console.log('\nNo se encontraron versiones alternativas para este personaje.');
    } else {
      console.log(`\nSe encontraron ${versionesAlternativas.length} versiones alternativas:`);
      console.table(versionesAlternativas, ['id', 'name', 'speciesId', 'dimensionId', 'state', 'nivelIntelligence', 'affiliation']);
    }
  } catch (error: any) {
    console.log(`\n ERROR DEL SISTEMA -- >  ${error.message} \n`);
  }
}

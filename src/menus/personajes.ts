import prompts from 'prompts';

async function pausar(): Promise<void> {
  await prompts({ type: 'invisible', name: 'p', message: 'Presiona Enter para continuar...' });
}

export async function menuPersonajes(): Promise<void> {
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
        break;
      case 'delete':
        console.log('\n[TODO: Eliminar personaje]');
        await pausar();
        break;
      case 'update':
        console.log('\n[TODO: Modificar personaje]');
        await pausar();
        break;
      case 'consult':
        console.log('\n[TODO: Consultar y ordenar]');
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
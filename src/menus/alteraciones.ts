import prompts from 'prompts';
import { GestorMultiverso } from '../gestor/gestor.js';
import { Dimension } from '../interfaces/dimension.js';

export async function menuAlteraciones(gestor: GestorMultiverso): Promise<void> {
  let salir = false;

  while (!salir) {
    console.clear();
    const { opcion } = await prompts({
      type: 'select',
      name: 'opcion',
      message: '--- MENÚ DE ALTERACIONES DIMENSIONALES ---',
      choices: [
        { title: 'Registrar creación de dimensión', value: 'creacion' },
        { title: 'Registrar destrucción de dimensión', value: 'destruccion' },
        { title: 'Volver al menú principal', value: 'volver' }
      ]
    });

    if (!opcion || opcion === 'volver') {
      salir = true;
      continue;
    }

    // Preguntas comunes para ambos tipos de eventos
    const { causa, descripcion } = await prompts([
      {
        type: 'select',
        name: 'causa',
        message: '¿Cuál fue la causa de esta alteración?',
        choices: [
          { title: 'Experimento científico', value: 'experimento' },
          { title: 'Paradoja temporal/multiversal', value: 'paradoja' }
        ]
      },
      {
        type: 'text',
        name: 'descripcion',
        message: 'Añade una breve descripción del evento:'
      }
    ]);

    if (!causa) continue; // Si el usuario cancela

    const idEvento = `ALT-${Date.now()}`;
    const fechaEvento = new Date().toISOString();

    switch (opcion) {
      case 'creacion': {
        console.log('\n--- DATOS DE LA NUEVA DIMENSIÓN ---');
        const nuevaDim = await prompts([
          { type: 'text', name: 'id', message: 'ID de la dimensión (ej. C-137):' },
          { type: 'text', name: 'name', message: 'Nombre de la dimensión:' },
          { type: 'number', name: 'nivelTecnolog', message: 'Nivel tecnológico (1-10):', min: 1, max: 10 },
          { type: 'text', name: 'description', message: 'Descripción de la dimensión:' }
        ]);

        if (!nuevaDim.id) break;

        const dimensionNueva: Dimension = {
          id: nuevaDim.id,
          name: nuevaDim.name,
          state: 'activa', // Por defecto nace activa
          nivelTecnolog: nuevaDim.nivelTecnolog,
          description: nuevaDim.description
        };

        try {
          await gestor.alteracionesDimensionales.registrarAlteracion({
            id: idEvento,
            tipo: 'creacion',
            causa: causa,
            dimensionId: dimensionNueva.id,
            fecha: fechaEvento,
            descripcion: descripcion
          }, dimensionNueva);
          console.log('\n¡Creación dimensional registrada con éxito!');
        } catch (error: any) {
          console.log(`\n ERROR DEL SISTEMA -- >  ${error.message}`);
        }
        break;
      }

      case 'destruccion': {
        const dimensionesActivas = (gestor as any).db.data.dimensiones.filter((d: Dimension) => d.state === 'activa');
        
        if (dimensionesActivas.length === 0) {
          console.log('\nNo hay dimensiones activas registradas para destruir.');
          break;
        }

        const { dimDestruir } = await prompts({
          type: 'select',
          name: 'dimDestruir',
          message: 'Selecciona la dimensión que ha sido destruida:',
          choices: dimensionesActivas.map((d: Dimension) => ({ title: `${d.name} (${d.id})`, value: d.id }))
        });

        if (!dimDestruir) break;

        try {
          await gestor.alteracionesDimensionales.registrarAlteracion({
            id: idEvento,
            tipo: 'destruccion',
            causa: causa,
            dimensionId: dimDestruir,
            fecha: fechaEvento,
            descripcion: descripcion
          });
          console.log('\n¡Destrucción dimensional registrada con éxito! Los habitantes originarios vivos han pasado a estado "desconocido".');
        } catch (error: any) {
          console.log(`\n ERROR DEL SISTEMA -- >  ${error.message}`);
        }
        break;
      }
    }

    await prompts({
      type: 'text',
      name: 'pausa',
      message: 'Pulsa Enter para continuar...'
    });
  }
}
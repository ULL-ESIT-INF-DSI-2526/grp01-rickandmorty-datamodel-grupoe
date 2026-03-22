export interface AlteracionDimension {
  id: string;
  tipo: 'creacion' | 'destruccion';
  causa: 'experimento' | 'paradoja';
  dimensionId: string;
  fecha: string;
  descripcion: string;
}
import type { Service, IconName } from '../types';

export type ServiceItem = {
  id?: string;
  name: Service;
  detail: string;
  description: string;
  price: number;
  deadline: string;
  active?: boolean;
  icon: IconName;
};

// Valores abaixo servem apenas como estrutura visual/fallback inicial.
// Os serviços apresentados ao cliente são carregados de laundry_services.
export const services: ServiceItem[] = [
  { name: 'Lavagem e dobra', detail: 'Prático para o dia a dia', description: 'Prático para o dia a dia', price: 0, deadline: '', icon: 'shirt-outline' },
];

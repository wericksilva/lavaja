import type { Service, IconName } from '../types';

export const services: {
  name: Service;
  detail: string;
  price: number;
  icon: IconName;
}[] = [
  { name: 'Lavagem e dobra', detail: 'Prático para o dia a dia', price: 39.90, icon: 'shirt-outline' },
  { name: 'Lavar e passar', detail: 'Suas peças prontas para usar', price: 59.90, icon: 'sparkles-outline' },
  { name: 'Passadoria', detail: 'Só passar, sem lavar', price: 29.90, icon: 'cloud-outline' },
];

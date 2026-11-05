
import type { Service, IconName } from '../types';

export type ServiceItem = {
  name: Service;
  detail: string;
  description: string;
  price: number;
  icon: IconName;
};

export const services: ServiceItem[] = [
  {
    name: 'Lavagem e dobra',
    detail: 'Prático para o dia a dia',
    description: 'Prático para o dia a dia',
    price: 39.90,
    icon: 'shirt-outline',
  },
  {
    name: 'Lavar e passar',
    detail: 'Suas peças prontas para usar',
    description: 'Suas peças prontas para usar',
    price: 59.90,
    icon: 'sparkles-outline',
  },
  {
    name: 'Passadoria',
    detail: 'Só passar, sem lavar',
    description: 'Só passar, sem lavar',
    price: 29.90,
    icon: 'cloud-outline',
  },
];


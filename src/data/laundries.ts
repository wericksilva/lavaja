export type Laundry = {
  id: string;
  name: string;
  rating: string;
  distance: string;
  deliveryFee: number;
  address: string;
  description: string;
};

export const laundries: Laundry[] = [
  {
    id: 'lavanderia-1',
    name: 'Lavanderia Express',
    rating: '4,9',
    distance: '1,2 km',
    deliveryFee: 8.90,
    address: 'Centro',
    description: 'Agilidade e cuidado com suas roupas.',
  },
  {
    id: 'lavanderia-2',
    name: 'Lavanderia Premium',
    rating: '4,8',
    distance: '2,5 km',
    deliveryFee: 10.00,
    address: 'Asa Sul',
    description: 'Cuidado especial para suas peças.',
  },
  {
    id: 'lavanderia-3',
    name: 'Lavanderia Central',
    rating: '4,7',
    distance: '3,1 km',
    deliveryFee: 7.00,
    address: 'Asa Norte',
    description: 'Praticidade para o dia a dia.',
  },
];
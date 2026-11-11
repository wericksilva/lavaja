export type Laundry = {
  id: string;
  name: string;
  rating: string;
  ratingCount?: number;
  distance: string;
  deliveryFee: number;
  address: string;
  description: string;

  // Coordenadas aproximadas do bairro/região enquanto o endereço
  // exato da unidade não for cadastrado.
  latitude: number;
  longitude: number;
};

export const laundries: Laundry[] = [
  {
    id: 'lavanderia-1',
    name: 'Lavanderia Express',
    rating: '4,9',
    distance: '1,2 km',
    deliveryFee: 8.90,
    address: 'Centro, Brasília - DF',
    description: 'Agilidade e cuidado com suas roupas.',
    // Referência aproximada da região central de Brasília.
    latitude: -15.7939,
    longitude: -47.8828,
  },
  {
    id: 'lavanderia-2',
    name: 'Lavanderia Premium',
    rating: '4,8',
    distance: '2,5 km',
    deliveryFee: 10.00,
    address: 'Asa Sul, Brasília - DF',
    description: 'Cuidado especial para suas peças.',
    // Centro aproximado da Asa Sul.
    latitude: -15.81695,
    longitude: -47.90005,
  },
  {
    id: 'lavanderia-3',
    name: 'Lavanderia Central',
    rating: '4,7',
    distance: '3,1 km',
    deliveryFee: 7.00,
    address: 'Asa Norte, Brasília - DF',
    description: 'Praticidade para o dia a dia.',
    // Centro aproximado da Asa Norte.
    latitude: -15.7628,
    longitude: -47.88395,
  },
];

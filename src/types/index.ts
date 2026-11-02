import { Ionicons } from '@expo/vector-icons';

export type Screen =
  | 'login'
  | 'register'
  | 'home'
  | 'orders'
  | 'profile'
  | 'schedule'
  | 'payment'
  | 'confirmation';

export type Service = 'Lavagem e dobra' | 'Lavar e passar' | 'Passadoria';
export type PaymentMethod = 'Pix' | 'Cartão de crédito' | 'Pagar na entrega';
export type Navigate = (screen: Screen) => void;
export type IconName = keyof typeof Ionicons.glyphMap;

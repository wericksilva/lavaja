
import { Ionicons } from '@expo/vector-icons';

export type Screen =
  | 'login'
  | 'register'
  | 'home'
  | 'schedule'
  | 'payment'
  | 'confirmation'
  | 'orders'
  | 'profile'
  | 'admin'
  | 'tracking'
  | 'forgotPassword'
  | 'helpSupport'
  | 'laundryDetails'
  | 'services';

export type Service = string;

export type PaymentMethod = string;

export type Navigate = (screen: Screen) => void;

export type IconName = keyof typeof Ionicons.glyphMap;

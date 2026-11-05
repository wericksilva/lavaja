export type LaundryOrder = {
  id: string;
  service: string;
  date: string;
  value: number;
  currentStep: number;

  // Detalhes adicionais do pedido
  time?: string;
  address?: string;
  instructions?: string;
  payment?: string;
  status?: string;
  paymentStatus?: string;
};
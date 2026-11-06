import type { PaymentMethod } from '../types';

/**
 * Valores estáveis gravados no Supabase. A interface continua exibindo os
 * nomes amigáveis em português, sem depender deles nas restrições do banco.
 */
export function paymentToDbValue(value: PaymentMethod): string {
  switch (value) {
    case 'Pix':
      return 'pix';
    case 'Cartão de crédito':
      return 'credit_card';
    case 'Pagar na entrega':
      return 'cash';
    default:
      return 'pix';
  }
}

export function paymentFromDbValue(value: string | null | undefined): PaymentMethod {
  switch ((value ?? '').trim().toLowerCase()) {
    case 'credit_card':
    case 'cartão de crédito':
    case 'cartao de credito':
    case 'cartão':
    case 'cartao':
      return 'Cartão de crédito';
    case 'cash':
    case 'dinheiro':
    case 'pagar na entrega':
      return 'Pagar na entrega';
    case 'pix':
      return 'Pix';
    default:
      return value?.trim() || 'Pix';
  }
}

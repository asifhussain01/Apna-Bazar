export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'COLLECTED' | 'FAILED';

export interface VillageAddress {
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  landmark: string;
  deliveryInstructions?: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: { en: string; hi: string };
  sku: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  image: string;
  itemTotal: number;
}

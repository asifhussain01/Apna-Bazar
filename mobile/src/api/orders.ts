import { apiClient, ApiResponse } from './client';

export interface CreateOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    alternatePhone?: string;
    state: string;
    district: string;
    village: string;
    pincode: string;
    landmark: string;
    deliveryInstructions?: string;
  };
  guestName?: string;
  guestPhone?: string;
}

export const submitOrder = async (payload: CreateOrderPayload): Promise<ApiResponse<any>> => {
  // Generate unique idempotency key per order checkout attempt
  const idempotencyKey = `mob-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return apiClient('/orders', {
    method: 'POST',
    idempotencyKey,
    body: JSON.stringify(payload)
  });
};

export const fetchMyOrders = async (phoneNumber?: string): Promise<any[]> => {
  const query = phoneNumber ? `?phone=${encodeURIComponent(phoneNumber)}` : '';
  const res = await apiClient<any[]>(`/orders/my-orders${query}`);
  if (res.success && res.data) {
    return res.data;
  }
  return [];
};

export const fetchOrderDetails = async (orderId: string): Promise<any | null> => {
  const res = await apiClient<any>(`/orders/${orderId}`);
  if (res.success && res.data) {
    return res.data;
  }
  return null;
};

export const cancelOrderApi = async (orderId: string, reason: string): Promise<ApiResponse<any>> => {
  return apiClient(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
};

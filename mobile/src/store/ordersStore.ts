import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyOrders } from '../api/orders';

export interface OrderItem {
  productId?: string;
  name: {
    en: string;
    hi: string;
  };
  sku?: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  image?: string;
  itemTotal: number;
}

export interface OrderData {
  _id: string;
  orderNumber: string;
  orderStatus: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  subtotal: number;
  deliveryCharge: number;
  items: OrderItem[];
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    village: string;
    district?: string;
    landmark?: string;
  };
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  shopkeeperName?: string;
  shopkeeperPhone?: string;
  assignedShopkeeper?: {
    name: string;
    phoneNumber?: string;
    acceptedAt?: string;
  };
}

interface OrdersState {
  orders: OrderData[];
  loading: boolean;
  addOrder: (order: OrderData) => Promise<void>;
  loadOrders: (phone?: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: string,
    extraData?: {
      shopkeeperName?: string;
      shopkeeperPhone?: string;
      assignedShopkeeper?: any;
    }
  ) => void;
}

const ORDERS_STORAGE_KEY = '@apna_bazar_my_orders_v2';

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,

  addOrder: async (newOrder: OrderData) => {
    try {
      const current = get().orders;
      // Prepend and de-duplicate by _id and orderNumber
      const filtered = current.filter(
        o => o._id !== newOrder._id && o.orderNumber !== newOrder.orderNumber
      );
      const updated = [newOrder, ...filtered];
      set({ orders: updated });
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[OrdersStore] Error adding order:', e);
    }
  },

  loadOrders: async (phone?: string) => {
    try {
      set({ loading: true });

      // 1. Load locally cached orders first
      const localData = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      let localOrders: OrderData[] = [];
      if (localData) {
        try {
          localOrders = JSON.parse(localData);
          if (Array.isArray(localOrders)) {
            set({ orders: localOrders });
          }
        } catch (e) {}
      }

      // 2. Fetch fresh order statuses from server
      const serverOrders = await fetchMyOrders(phone);
      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        // Merge server and local orders, prioritizing server data for status
        const map = new Map<string, OrderData>();

        // First put local
        localOrders.forEach(o => {
          const key = o._id || o.orderNumber;
          if (key) map.set(key, o);
        });

        // Overlay server
        serverOrders.forEach((o: any) => {
          const key = o._id || o.orderNumber;
          if (key) map.set(key, o);
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        set({ orders: merged });
        await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('[OrdersStore] Error loading orders:', e);
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: (
    orderId: string,
    status: any,
    extraData?: {
      shopkeeperName?: string;
      shopkeeperPhone?: string;
      assignedShopkeeper?: any;
    }
  ) => {
    const updated = get().orders.map(o =>
      o._id === orderId || o.orderNumber === orderId
        ? {
            ...o,
            orderStatus: status,
            ...(extraData?.shopkeeperName ? { shopkeeperName: extraData.shopkeeperName } : {}),
            ...(extraData?.shopkeeperPhone ? { shopkeeperPhone: extraData.shopkeeperPhone } : {}),
            ...(extraData?.assignedShopkeeper ? { assignedShopkeeper: extraData.assignedShopkeeper } : {})
          }
        : o
    );
    set({ orders: updated });
    AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  }
}));

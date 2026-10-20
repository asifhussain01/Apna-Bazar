import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  productId: string;
  name: {
    en: string;
    hi: string;
  };
  sku: string;
  salePrice: number;
  mrp: number;
  unit: string;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  freeDeliveryThreshold: number;
  deliveryFee: number;
  addItem: (product: any, qty?: number) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  saveCart: () => Promise<void>;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotalAmount: () => number;
  getItemCount: () => number;
  getAmountNeededForFreeDelivery: () => number;
}

const CART_STORAGE_KEY = '@shopease_persistent_cart';

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  freeDeliveryThreshold: 499,
  deliveryFee: 20,

  addItem: (product: any, qty: number = 1) => {
    const { items } = get();
    const existingIndex = items.findIndex(it => it.productId === (product._id || product.id || product.productId));

    let updatedItems: CartItem[];
    if (existingIndex > -1) {
      updatedItems = [...items];
      updatedItems[existingIndex].quantity += qty;
    } else {
      const newItem: CartItem = {
        productId: product._id || product.id || product.productId,
        name: {
          en: product.name?.en || product.name || '',
          hi: product.name?.hi || product.name || ''
        },
        sku: product.sku || 'SKU',
        salePrice: product.salePrice ?? product.price,
        mrp: product.price ?? product.salePrice,
        unit: product.unit || '1 unit',
        image: product.images && product.images.length > 0 ? product.images[0] : (product.image || ''),
        quantity: qty
      };
      updatedItems = [...items, newItem];
    }

    set({ items: updatedItems });
    get().saveCart();
  },

  updateQuantity: (productId: string, delta: number) => {
    const { items } = get();
    const updatedItems = items
      .map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    set({ items: updatedItems });
    get().saveCart();
  },

  removeItem: (productId: string) => {
    const updated = get().items.filter(it => it.productId !== productId);
    set({ items: updated });
    get().saveCart();
  },

  clearCart: () => {
    set({ items: [] });
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
  },

  loadCart: async () => {
    try {
      const json = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          set({ items: parsed });
        }
      }
    } catch (e) {
      console.warn('Failed to load local cart', e);
    }
  },

  saveCart: async () => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(get().items));
    } catch (e) {
      console.warn('Failed to save cart to storage', e);
    }
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= get().freeDeliveryThreshold ? 0 : get().deliveryFee;
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal + get().getDeliveryFee();
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  getAmountNeededForFreeDelivery: () => {
    const subtotal = get().getSubtotal();
    const threshold = get().freeDeliveryThreshold;
    return Math.max(0, threshold - subtotal);
  }
}));

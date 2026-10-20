import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VillageAddress {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  alternatePhone?: string;
  state: string;
  district: string;
  village: string;
  pincode: string;
  landmark: string;
  deliveryInstructions?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: 'customer' | 'admin';
  languagePreference: 'hi' | 'en';
  addresses?: VillageAddress[];
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  guestPhone: string;
  guestName: string;
  activeAddress: VillageAddress | null;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string) => Promise<void>;
  setGuestInfo: (name: string, phone: string) => void;
  setActiveAddress: (address: VillageAddress) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

const AUTH_KEY = '@shopease_auth_data';
const ADDRESS_KEY = '@shopease_active_village_address';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  guestPhone: '',
  guestName: '',
  activeAddress: null,
  isLoading: true,

  setAuth: async (user: UserProfile, token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user, token }));
      set({ user, token });
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        get().setActiveAddress(defaultAddr);
      }
    } catch (e) {
      set({ user, token });
    }
  },

  setGuestInfo: (name: string, phone: string) => {
    set({ guestName: name, guestPhone: phone });
  },

  setActiveAddress: async (address: VillageAddress) => {
    try {
      await AsyncStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
      set({ activeAddress: address });
    } catch (e) {
      set({ activeAddress: address });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      set({ user: null, token: null });
    } catch (e) {
      set({ user: null, token: null });
    }
  },

  loadAuth: async () => {
    try {
      const [authData, savedAddress] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(ADDRESS_KEY)
      ]);

      let parsedUser = null;
      let parsedToken = null;
      let parsedAddr = null;

      if (authData) {
        const parsed = JSON.parse(authData);
        parsedUser = parsed.user;
        parsedToken = parsed.token;
      }

      if (savedAddress) {
        parsedAddr = JSON.parse(savedAddress);
      } else if (parsedUser?.addresses?.length > 0) {
        parsedAddr = parsedUser.addresses[0];
      }

      set({
        user: parsedUser,
        token: parsedToken,
        activeAddress: parsedAddr,
        isLoading: false
      });
    } catch (e) {
      set({ isLoading: false });
    }
  }
}));

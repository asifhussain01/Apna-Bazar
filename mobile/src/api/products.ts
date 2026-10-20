import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, ApiResponse } from './client';

const PRODUCTS_CACHE_KEY = '@shopease_cached_products';
const CATEGORIES_CACHE_KEY = '@shopease_cached_categories';

export const fetchProducts = async (params: {
  category?: string;
  search?: string;
  featured?: boolean;
} = {}): Promise<any[]> => {
  const queryParts: string[] = [];
  if (params.category) queryParts.push(`category=${params.category}`);
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params.featured) queryParts.push(`featured=true`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const res = await apiClient<any[]>(`/products${qs}`);

  if (res.success && res.data) {
    // Cache the latest product data for offline rural browsing
    if (!params.category && !params.search) {
      AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(res.data)).catch(() => {});
    }
    return res.data;
  }

  // Fallback to offline cached data
  try {
    const cached = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    if (cached) {
      console.log('[Products] Returning cached offline products');
      return JSON.parse(cached);
    }
  } catch (e) {}

  return [];
};

export const fetchProductById = async (id: string): Promise<any | null> => {
  const res = await apiClient<any>(`/products/${id}`);
  if (res.success && res.data) {
    return res.data;
  }
  return null;
};

export const fetchCategories = async (): Promise<any[]> => {
  const res = await apiClient<any[]>('/categories');
  if (res.success && res.data) {
    AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(res.data)).catch(() => {});
    return res.data;
  }

  // Fallback to offline cache
  try {
    const cached = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  return [];
};

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

// Automatically detect host IP when running on physical phone or emulator
const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // When loaded on a physical phone via Expo Go, hostUri contains "192.168.x.x:8081"
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: any;
  errors?: any;
}

export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestInit & { idempotencyKey?: string } = {}
): Promise<ApiResponse<T>> => {
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>)
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[API Client] Network error on ${url}:`, error);
    return {
      success: false,
      message: 'नेटवर्क समस्या: कृपया इंटरनेट कनेक्शन जांचें (Network error: please check connection)'
    };
  }
};

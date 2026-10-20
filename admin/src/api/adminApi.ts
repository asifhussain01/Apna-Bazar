const API_BASE_URL = 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('apna_bazar_admin_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('apna_bazar_admin_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('apna_bazar_admin_token');
};

export const adminApi = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>)
    }
  });

  if (response.status === 401 || response.status === 403) {
    // If token invalid, allow app to handle login
    if (window.location.pathname !== '/login') {
      // dispatch custom event or allow local handler
    }
  }

  return response.json();
};

export const downloadExcelReport = async (filters: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<void> => {
  const token = getAuthToken();
  const queryParts: string[] = [];

  if (filters.status && filters.status !== 'ALL') queryParts.push(`status=${filters.status}`);
  if (filters.startDate) queryParts.push(`startDate=${filters.startDate}`);
  if (filters.endDate) queryParts.push(`endDate=${filters.endDate}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const url = `${API_BASE_URL}/admin/orders/export-excel${qs}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to download Excel report');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  a.download = `Apna_Bazar_Orders_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

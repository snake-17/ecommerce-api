const API_BASE_URL = "http://localhost:3006/api";

export interface LoginResponse {
  token: string;
  name?: string;
  email?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  desc: string;
  category: string;
  price: string | number;
  img: string;
  active?: boolean;
  stock?: number;
}

/**
 * Common request wrapper to parse errors and handle responses cleanly.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set JSON headers by default
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  const config = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  let data: any;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    // Return backend error message if available, otherwise generic message
    const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async editProfile(token: string, name: string, email: string, password: string): Promise<void> {
    return apiRequest<void>("/auth/edit", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, password }),
    });
  },
};

export const productsApi = {
  async getProducts(token: string): Promise<ApiProduct[]> {
    return apiRequest<ApiProduct[]>("/products/show", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export interface CreateOrderResponse {
  orden: number;
}

export interface AddItemsResponse {
  count: number;
}

export const ordersApi = {
  async createOrder(token: string): Promise<CreateOrderResponse> {
    return apiRequest<CreateOrderResponse>("/orders/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
  },

  async addItems(
    token: string,
    orderId: number,
    items: { productId: number; quantity: number }[]
  ): Promise<AddItemsResponse> {
    return apiRequest<AddItemsResponse>(`/orders/${orderId}/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    });
  },

  async payOrder(token: string, orderId: number): Promise<void> {
    return apiRequest<void>(`/orders/${orderId}/pay`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async cancelOrder(token: string, orderId: number): Promise<void> {
    return apiRequest<void>(`/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};


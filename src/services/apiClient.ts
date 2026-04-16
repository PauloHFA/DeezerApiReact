import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiClientOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * API Client com retry automático, timeout e centralized error handling
 */
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;
  private client: AxiosInstance;

  constructor(baseURL: string = '/api', options: ApiClientOptions = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 10000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    
    this.client = axios.create({
      baseURL,
      timeout: this.timeout,
    });
  }

  /**
   * Retry com backoff exponencial
   */
  async retryWithBackoff<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error as any;
      
      // Não retry se for erro do cliente (4xx)
      if (
        axiosError.response?.status >= 400 &&
        axiosError.response?.status < 500
      ) {
        throw error;
      }

      if (retries > 0) {
        const delay = this.retryDelay * (this.maxRetries - retries + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(requestFn, retries - 1);
      }

      throw error;
    }
  }

  /**
   * GET request com retry automático
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await this.retryWithBackoff(() =>
        this.client.get<T>(endpoint, {
          params: this._encodeParams(params),
        })
      );
      return response.data;
    } catch (error) {
      this._handleError(error, 'GET', endpoint);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any = {}): Promise<T> {
    try {
      const response = await this.retryWithBackoff(() =>
        this.client.post<T>(endpoint, data)
      );
      return response.data;
    } catch (error) {
      this._handleError(error, 'POST', endpoint);
      throw error;
    }
  }

  /**
   * Encode params com URI encoding adequado
   */
  private _encodeParams(params: Record<string, any>): Record<string, any> {
    const encoded: Record<string, any> = {};
    for (const key in params) {
      encoded[key] = encodeURIComponent(String(params[key]));
    }
    return encoded;
  }

  /**
   * Centralized error handling
   */
  private _handleError(error: any, method: string = '', endpoint: string = ''): void {
    const errorInfo = {
      method,
      endpoint,
      timestamp: new Date().toISOString(),
      message: error.message,
    };

    if (error.response) {
      // Erro do servidor (status !== 2xx)
      const status = error.response.status;
      const data = error.response.data;
      console.error(
        `[API Error] ${method} ${endpoint} - Status: ${status}`,
        { ...errorInfo, status, data }
      );
    } else if (error.request) {
      // Request foi feito mas sem resposta
      console.error(
        `[API Error] ${method} ${endpoint} - No response from server`,
        { ...errorInfo, type: 'NO_RESPONSE' }
      );
    } else {
      // Erro ao preparar request
      console.error(
        `[API Error] ${method} ${endpoint} - Request error`,
        { ...errorInfo, type: 'REQUEST_ERROR' }
      );
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || '/api', {
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  maxRetries: parseInt(import.meta.env.VITE_API_RETRIES || '3'),
});

export default apiClient;

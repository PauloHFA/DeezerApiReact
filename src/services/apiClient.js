import axios from 'axios';

/**
 * API Client com retry automático, timeout e centralized error handling
 */
class ApiClient {
  constructor(baseURL = '/api', options = {}) {
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
  async retryWithBackoff(requestFn, retries = this.maxRetries) {
    try {
      return await requestFn();
    } catch (error) {
      // Não retry se for erro do cliente (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
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
  async get(endpoint, params = {}) {
    try {
      const response = await this.retryWithBackoff(() =>
        this.client.get(endpoint, {
          params: this._encodeParams(params),
        })
      );
      return response.data;
    } catch (error) {
      this._handleError(error, 'GET', endpoint);
    }
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.retryWithBackoff(() =>
        this.client.post(endpoint, data)
      );
      return response.data;
    } catch (error) {
      this._handleError(error, 'POST', endpoint);
    }
  }

  /**
   * Encode params com URI encoding adequado
   */
  _encodeParams(params) {
    const encoded = {};
    for (const key in params) {
      encoded[key] = encodeURIComponent(params[key]);
    }
    return encoded;
  }

  /**
   * Centralized error handling
   */
  _handleError(error, method = '', endpoint = '') {
    const errorInfo = {
      method,
      endpoint,
      timestamp: new Date().toISOString(),
      message: error.message,
    };

    if (error.response) {
      // Erro do servidor (status !== 2xx)
      errorInfo.status = error.response.status;
      errorInfo.data = error.response.data;
      console.error(
        `[API Error] ${method} ${endpoint} - Status: ${error.response.status}`,
        errorInfo
      );
    } else if (error.request) {
      // Request foi feito mas sem resposta
      errorInfo.type = 'NO_RESPONSE';
      console.error(`[API Error] ${method} ${endpoint} - No response from server`, errorInfo);
    } else {
      // Erro ao preparar request
      errorInfo.type = 'REQUEST_ERROR';
      console.error(`[API Error] ${method} ${endpoint} - Request error`, errorInfo);
    }

    throw error;
  }
}

// Singleton instance
export const apiClient = new ApiClient(process.env.VITE_API_BASE_URL || '/api', {
  timeout: parseInt(process.env.VITE_API_TIMEOUT || '10000'),
  maxRetries: parseInt(process.env.VITE_API_RETRIES || '3'),
});

export default apiClient;

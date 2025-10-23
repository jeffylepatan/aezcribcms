import { AuthService } from './auth';

interface CreditResponse {
  success: boolean;
  credits: number;
  user_id: number;
}

interface AddCreditsRequest {
  real_amount: number;
  payment_method: string;
  payment_reference?: string;
}

interface AddCreditsResponse {
  success: boolean;
  message: string;
  transaction_id?: number;
  credits_requested?: number;
  real_amount?: number;
  status?: string;
  error?: string;
}

interface PurchaseWorksheetResponse {
  success: boolean;
  message: string;
  transaction_id?: number;
  remaining_credits?: number;
  required?: number;
  available?: number;
  error?: string;
}

interface UserWorksheet {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  purchaseDate: string;
  price: number;
  downloadUrl: string;
  thumbnail?: string;
}

interface UserWorksheetsResponse {
  success: boolean;
  worksheets: UserWorksheet[];
  count: number;
  error?: string;
}

interface Transaction {
  id: number;
  type: 'credit_purchase' | 'worksheet_purchase';
  amount: number;
  description: string;
  date: string;
  status: string;
  real_amount?: number;
}

interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
  count: number;
  error?: string;
}

interface Recommendation {
  id: number;
  title: string;
  subject: string;
  gradeLevel: string;
  price: number;
  rating: number;
  popularity: number;
  thumbnail?: string;
}

interface RecommendationsResponse {
  success: boolean;
  recommendations: Recommendation[];
  count: number;
  user_id: number;
  error?: string;
}

class CommerceService {
  private baseUrl: string;

  constructor() {
    // Drupal is installed in /app/ subdirectory
    this.baseUrl = 'https://aezcrib.xyz/app';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get the auth token
    const token = AuthService.getToken();
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        // If it's a 404, the API might not be available yet
        if (response.status === 404) {
          throw new Error(`API endpoint not found: ${endpoint}. Make sure the commerce module is installed on the Drupal site.`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to API at ${this.baseUrl}. Please check if the Drupal site is accessible and CORS is configured.`);
      }
      throw error;
    }
  }

  // Get user's current AezCoins balance
  async getCredits(): Promise<CreditResponse> {
    return this.makeRequest<CreditResponse>('/api/aezcrib/credits');
  }

  // Request credit addition (donation)
  async addCredits(data: AddCreditsRequest): Promise<AddCreditsResponse> {
    return this.makeRequest<AddCreditsResponse>('/api/aezcrib/credits/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get conversion rates
  async getRates() {
    return this.makeRequest('/api/aezcrib/credits/rates');
  }

  // Purchase a worksheet
  async purchaseWorksheet(worksheetId: number): Promise<PurchaseWorksheetResponse> {
    return this.makeRequest<PurchaseWorksheetResponse>(`/api/aezcrib/purchase/worksheet/${worksheetId}`, {
      method: 'POST',
    });
  }

  // Check if user can purchase a worksheet
  async checkPurchaseEligibility(worksheetId: number) {
    return this.makeRequest(`/api/aezcrib/purchase/check/${worksheetId}`);
  }

  // Get user's purchased worksheets
  async getUserWorksheets(): Promise<UserWorksheetsResponse> {
    return this.makeRequest<UserWorksheetsResponse>('/api/aezcrib/user/worksheets');
  }

  // Download a purchased worksheet
  async downloadWorksheet(worksheetId: number): Promise<Blob> {
    const url = `${this.baseUrl}/api/aezcrib/download/worksheet/${worksheetId}`;
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Download failed! status: ${response.status}`);
    }
    
    return response.blob();
  }

  // Get transaction history
  async getTransactions(): Promise<TransactionsResponse> {
    return this.makeRequest<TransactionsResponse>('/api/aezcrib/user/transactions');
  }

  // Get personalized recommendations
  async getRecommendations(): Promise<RecommendationsResponse> {
    return this.makeRequest<RecommendationsResponse>('/api/aezcrib/recommendations');
  }
}

export const commerceService = new CommerceService();

export type {
  CreditResponse,
  AddCreditsRequest,
  AddCreditsResponse,
  PurchaseWorksheetResponse,
  UserWorksheet,
  UserWorksheetsResponse,
  Transaction,
  TransactionsResponse,
  Recommendation,
  RecommendationsResponse,
};
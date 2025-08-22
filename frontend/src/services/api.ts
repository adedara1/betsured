import axios, { AxiosInstance } from 'axios';
import { ArberInstance, BookieInfo, Statistics } from '../types';

class ApiService {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour la gestion des erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      },
    );
  }

  // Récupérer tous les arbers actifs
  async getArbers(): Promise<ArberInstance[]> {
    try {
      const response = await this.client.get('/api/arbers');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch arbers:', error);
      return [];
    }
  }

  // Récupérer un arber spécifique
  async getArber(id: string): Promise<ArberInstance | null> {
    try {
      const response = await this.client.get(`/api/arbers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch arber ${id}:`, error);
      return null;
    }
  }

  // Récupérer les bookies
  async getBookies(): Promise<BookieInfo[]> {
    try {
      const response = await this.client.get('/api/bookies');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch bookies:', error);
      return [];
    }
  }

  // Récupérer les statistiques
  async getStatistics(): Promise<Statistics> {
    try {
      const response = await this.client.get('/api/statistics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      return {
        totalOpportunities: 0,
        profitableOpportunities: 0,
        totalPotentialProfit: 0,
        averageProfit: 0,
        successRate: 0,
      };
    }
  }

  // Créer un nouvel arber
  async createArber(config: {
    name: string;
    bookies: string[];
    investment: { amount: number; currency: string };
    strategy: string;
  }): Promise<ArberInstance | null> {
    try {
      const response = await this.client.post('/api/arbers', config);
      return response.data;
    } catch (error) {
      console.error('Failed to create arber:', error);
      return null;
    }
  }

  // Mettre à jour la configuration d'un arber
  async updateArber(
    id: string,
    updates: Partial<{ investment: { amount: number; currency: string } }>,
  ): Promise<boolean> {
    try {
      await this.client.put(`/api/arbers/${id}`, updates);
      return true;
    } catch (error) {
      console.error(`Failed to update arber ${id}:`, error);
      return false;
    }
  }

  // Supprimer un arber
  async deleteArber(id: string): Promise<boolean> {
    try {
      await this.client.delete(`/api/arbers/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete arber ${id}:`, error);
      return false;
    }
  }

  // Contrôles d'arber
  async pauseArber(id: string): Promise<boolean> {
    try {
      await this.client.post(`/api/arbers/${id}/pause`);
      return true;
    } catch (error) {
      console.error(`Failed to pause arber ${id}:`, error);
      return false;
    }
  }

  async resumeArber(id: string): Promise<boolean> {
    try {
      await this.client.post(`/api/arbers/${id}/resume`);
      return true;
    } catch (error) {
      console.error(`Failed to resume arber ${id}:`, error);
      return false;
    }
  }

  // Récupérer l'historique des opportunités
  async getOpportunityHistory(limit: number = 100): Promise<any[]> {
    try {
      const response = await this.client.get(
        `/api/opportunities/history?limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch opportunity history:', error);
      return [];
    }
  }

  // Test de connexion avec le backend
  async ping(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/ping');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const apiService = new ApiService();

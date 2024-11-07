import axios from 'axios';

interface CoinGeckoPrice {
  [key: string]: {
    sek: number;
    sek_24h_change: number;
  };
}

export class PriceService {
  private static readonly API_BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly COIN_MAP: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'USDT': 'tether',
    'ADA': 'cardano',
    // Lägg till fler mappningar efter behov
  };

  static async getPrices(assets: string[]): Promise<Map<string, { price: number, change24h: number }>> {
    try {
      const mockPrices = new Map<string, { price: number, change24h: number }>();
      assets.forEach(asset => {
        mockPrices.set(asset, {
          price: Math.random() * 1000,
          change24h: (Math.random() * 20) - 10
        });
      });
      return mockPrices;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      throw new Error('Failed to fetch current prices');
    }
  }

  static getCoinId(asset: string): string | undefined {
    return this.COIN_MAP[asset];
  }
} 
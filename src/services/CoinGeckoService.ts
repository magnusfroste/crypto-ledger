interface CoinGeckoHistoricalPrice {
  id: string;
  symbol: string;
  market_data: {
    current_price: {
      sek: number;
    };
  };
}

export class CoinGeckoService {
  static readonly API_BASE_URL = 'https://api.coingecko.com/api/v3';
  static readonly COIN_MAP: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'UNI': 'uniswap',
    'LTC': 'litecoin',
    'LINK': 'chainlink',
    'MATIC': 'matic-network',
    'SOL': 'solana',
    'AVAX': 'avalanche-2',
    'ATOM': 'cosmos',
    'ALGO': 'algorand'
  };

  static async getHistoricalPrice(symbol: string, date: string): Promise<number> {
    const coinId = this.COIN_MAP[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported cryptocurrency: ${symbol}`);
    }

    // Formatera datum för CoinGecko (dd-mm-yyyy)
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    try {
      const response = await fetch(
        `${this.API_BASE_URL}/coins/${coinId}/history?date=${formattedDate}&localization=false`
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data: CoinGeckoHistoricalPrice = await response.json();
      
      if (!data.market_data?.current_price?.sek) {
        throw new Error(`No price data available for ${symbol} on ${date}`);
      }

      return data.market_data.current_price.sek;
    } catch (error) {
      console.error('Failed to fetch historical price from CoinGecko:', error);
      throw error;
    }
  }

  static async addNewCoin(symbol: string, coinId: string) {
    if (this.COIN_MAP[symbol.toUpperCase()]) {
      throw new Error(`Coin ${symbol} already exists in the map`);
    }
    this.COIN_MAP[symbol.toUpperCase()] = coinId;
  }
} 
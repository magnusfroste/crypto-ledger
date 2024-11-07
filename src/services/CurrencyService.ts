import { CoinGeckoService } from './CoinGeckoService';
import { RiksbankService } from './RiksbankService';

interface ExchangeRate {
  date: string;  // ISO date string
  rate: number;
  timestamp: number;  // När kursen hämtades
}

interface CurrencyRates {
  [currency: string]: {
    [date: string]: ExchangeRate;
  };
}

export class CurrencyService {
  private static readonly CACHE_KEY = 'currency_rates_cache';
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 timmar i millisekunder
  private static rates: CurrencyRates = {};
  
  static async getRate(currency: string, date: Date): Promise<number> {
    const dateStr = date.toISOString().split('T')[0];
    
    // Ladda cache från localStorage om det behövs
    if (Object.keys(this.rates).length === 0) {
      this.loadCache();
    }

    // Kontrollera om vi har en cachad kurs som inte är för gammal
    const cachedRate = this.rates[currency]?.[dateStr];
    if (cachedRate && !this.isCacheExpired(cachedRate.timestamp)) {
      return cachedRate.rate;
    }

    try {
      const rate = await this.fetchRate(currency, dateStr);
      
      // Cacha resultatet
      this.cacheRate(currency, dateStr, rate);
      
      return rate;
    } catch (error) {
      console.error(`Failed to get rate for ${currency} on ${dateStr}:`, error);
      
      // Om vi har en cachad kurs, använd den även om den är gammal
      if (cachedRate) {
        console.log(`Using expired cached rate for ${currency} on ${dateStr}`);
        return cachedRate.rate;
      }
      
      throw new Error(`Could not get exchange rate for ${currency}`);
    }
  }

  private static loadCache() {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        this.rates = JSON.parse(cached);
      }
    } catch (error) {
      console.error('Failed to load currency rates cache:', error);
      this.rates = {};
    }
  }

  private static saveCache() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.rates));
    } catch (error) {
      console.error('Failed to save currency rates cache:', error);
    }
  }

  private static cacheRate(currency: string, date: string, rate: number) {
    if (!this.rates[currency]) {
      this.rates[currency] = {};
    }
    
    this.rates[currency][date] = {
      date,
      rate,
      timestamp: Date.now()
    };
    
    this.saveCache();
  }

  private static isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_EXPIRY;
  }

  private static async fetchRate(currency: string, date: string): Promise<number> {
    if (this.isCryptoCurrency(currency)) {
      return this.fetchCryptoRate(currency, date);
    }
    return this.fetchFiatRate(currency, date);
  }

  private static async fetchFiatRate(currency: string, date: string): Promise<number> {
    try {
      return await RiksbankService.getExchangeRate(currency, date);
    } catch (error) {
      console.error(`Failed to fetch fiat rate for ${currency}:`, error);
      throw error;
    }
  }

  private static async fetchCryptoRate(currency: string, date: string): Promise<number> {
    try {
      return await CoinGeckoService.getHistoricalPrice(currency, date);
    } catch (error) {
      console.error(`Failed to fetch crypto rate for ${currency}:`, error);
      throw error;
    }
  }

  private static isCryptoCurrency(currency: string): boolean {
    return CoinGeckoService.COIN_MAP.hasOwnProperty(currency.toUpperCase());
  }

  static async convertToSEK(amount: number, currency: string, date: Date): Promise<number> {
    if (currency === 'SEK') return amount;
    const rate = await this.getRate(currency, date);
    return amount * rate;
  }

  // Metod för att rensa cachen manuellt
  static clearCache() {
    this.rates = {};
    localStorage.removeItem(this.CACHE_KEY);
  }
} 
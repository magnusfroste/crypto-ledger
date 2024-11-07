interface RiksbankRate {
  date: string;
  value: number;
}

export class RiksbankService {
  private static readonly API_BASE_URL = 'https://swea.riksbank.se/sweaWS/services/SweaWebServiceHttpSoap12Endpoint';
  private static readonly CURRENCY_MAP: { [key: string]: string } = {
    'USD': 'USDSEK',
    'EUR': 'EURSEK',
    'GBP': 'GBPSEK',
    'JPY': 'JPYSEK',
    'NOK': 'NOKSEK',
    'DKK': 'DKKSEK',
    'CHF': 'CHFSEK'
  };
  
  static async getExchangeRate(currency: string, date: string): Promise<number> {
    const seriesId = this.CURRENCY_MAP[currency.toUpperCase()];
    if (!seriesId) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    try {
      // Skapa SOAP request
      const body = this.createSoapRequest(seriesId, date);
      
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml;charset=UTF-8',
          'Accept': 'application/soap+xml'
        },
        body
      });

      if (!response.ok) {
        throw new Error(`Riksbank API error: ${response.statusText}`);
      }

      const data = await response.text();
      return this.parseSoapResponse(data);

    } catch (error) {
      console.error('Failed to fetch exchange rate from Riksbank:', error);
      throw error;
    }
  }

  private static createSoapRequest(seriesId: string, date: string): string {
    return `
      <soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                      xmlns:xsd="http://www.riksbank.se/xsd">
        <soap12:Body>
          <xsd:getInterestAndExchangeRates>
            <searchRequestParameters>
              <aggregateMethod>D</aggregateMethod>
              <datefrom>${date}</datefrom>
              <dateto>${date}</dateto>
              <languageid>en</languageid>
              <series_id>${seriesId}</series_id>
            </searchRequestParameters>
          </xsd:getInterestAndExchangeRates>
        </soap12:Body>
      </soap12:Envelope>
    `;
  }

  private static parseSoapResponse(xmlString: string): number {
    // Enkel XML-parsing för att hämta växelkursen
    const rateMatch = xmlString.match(/<value>([0-9.]+)<\/value>/);
    if (!rateMatch) {
      throw new Error('Could not find exchange rate in response');
    }
    
    const rate = parseFloat(rateMatch[1]);
    if (isNaN(rate)) {
      throw new Error('Invalid exchange rate value');
    }

    return rate;
  }

  // Fallback till cached/statiska kurser om API:et inte svarar
  private static getFallbackRate(currency: string): number {
    const fallbackRates: { [key: string]: number } = {
      'USD': 10.42,
      'EUR': 11.21,
      'GBP': 13.15,
      'JPY': 0.071,
      'NOK': 0.97,
      'DKK': 1.51,
      'CHF': 11.84
    };

    return fallbackRates[currency.toUpperCase()] || 1.0;
  }
} 
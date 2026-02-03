# Crypto Ledger - Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** February 2026  
> **Status:** Active Development

---

## Executive Summary

**Crypto Ledger** is a cryptocurrency ledger application for tracking and managing crypto transactions. Built with React for a modern, responsive interface, it provides real-time updates and portfolio management for cryptocurrency holdings.

### Target Users

- **Primary**: Cryptocurrency investors tracking their holdings
- **Secondary**: Traders managing multiple crypto assets
- **Tertiary**: Anyone interested in cryptocurrency portfolio tracking

### Unique Value Proposition

- **Transaction Tracking**: Monitor crypto transactions
- **Portfolio Management**: Track your crypto holdings
- **Real-Time Updates**: Stay updated with market changes
- **Responsive Design**: Works on desktop and mobile

---

## 1. Product Vision

Crypto Ledger aims to provide a simple, intuitive interface for cryptocurrency portfolio management, making it easy for users to track their holdings and transactions.

### Success Metrics

- **User Engagement**: Daily active users and session duration
- **Transaction Tracking**: Number of transactions tracked
- **Portfolio Value**: Total portfolio value tracked
- **User Satisfaction**: Rating of interface and features

---

## 2. Core Features

### 2.1 Transaction Tracking

**Priority:** P0 (Critical)

**Description:** Users can monitor their cryptocurrency transactions.

**Requirements:**
- Transaction history
- Transaction categorization
- Search and filter
- Export functionality

**User Stories:**
- As an investor, I want to track transactions so I know my activity
- As a trader, I want categorization so I can organize my trades
- As a user, I want search so I can find specific transactions

**Technical Notes:**
- Transaction data structure
- LocalStorage persistence
- Search and filter algorithms
- Export functionality (CSV/JSON)

---

### 2.2 Portfolio Management

**Priority:** P0 (Critical)

**Description:** Users can track their cryptocurrency holdings.

**Requirements:**
- Holdings overview
- Asset allocation display
- Portfolio value calculation
- Holdings history

**User Stories:**
- As an investor, I want holdings overview so I can see my portfolio
- As a trader, I want allocation display so I can manage risk
- As a user, I want value calculation so I know my net worth

**Technical Notes:**
- Portfolio data structure
- Asset allocation algorithm
- Value calculation logic
- History tracking system

---

### 2.3 Real-Time Updates

**Priority:** P1 (High)

**Description:** Users can stay updated with market changes.

**Requirements:**
- Price updates
- Portfolio value refresh
- Market data display
- Update frequency configuration

**User Stories:**
- As an investor, I want price updates so I know current values
- As a trader, I want portfolio refresh so I see real-time changes
- As a user, I want market data so I can make informed decisions

**Technical Notes:**
- API integration (CoinGecko, CoinMarketCap)
- Update scheduling
- Data caching
- Error handling

---

## 3. Technical Architecture

### 3.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 | UI framework |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Create React App | Build tooling |
| **Styling** | CSS | Custom styling |
| **API** | Crypto APIs | Market data |

### 3.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Crypto Ledger Frontend                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  React Application (TypeScript + CRA)                     ││
│  │  - Transaction Tracker                                 ││
│  │  - Portfolio Manager                                   ││
│  │  - Real-Time Updates                                   ││
│  │  - Data Display                                        ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Crypto APIs                                            ││
│  │  - CoinGecko API                                        ││
│  │  - CoinMarketCap API                                    ││
│  │  - Price Data                                           ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  LocalStorage (Transactions & Portfolio)                ││
│  │  - Transaction History                                   ││
│  │  - Holdings Data                                        ││
│  │  - User Preferences                                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow

**Transaction Tracking Flow:**
1. User adds transaction
2. Transaction categorized
3. Transaction saved to localStorage
4. Portfolio updated
5. Holdings recalculated

**Real-Time Updates Flow:**
1. Scheduled API call to crypto APIs
2. Price data fetched
3. Portfolio values updated
4. Display refreshed
5. User notified of changes

---

## 4. User Experience

### 4.1 Onboarding

**First-Time User Experience:**

1. **Welcome Screen**
   - Introduction to Crypto Ledger
   - Quick start guide
   - First transaction entry

2. **Tutorial**
   - How to add transactions
   - How to track holdings
   - How to view portfolio

### 4.2 Daily Use

**Typical Session:**
1. User opens Crypto Ledger
2. Views portfolio overview
3. Adds new transaction
4. Checks holdings
5. Reviews market data
6. Session auto-saved

### 4.3 Error States

**Graceful Degradation:**
- API failure: "Kan inte hämta marknadsdata just nu. Försök igen."
- Data parsing error: "Kunde inte tolka data. Försök igen."
- Storage error: "Kunde inte spara data. Försök igen."

---

## 5. Roadmap

### Phase 1: MVP (Current)

- ✅ Transaction tracking
- ✅ Portfolio management
- ✅ Real-time updates
- ✅ Responsive design

### Phase 2: Enhanced Experience (Q1 2026)

- 🔄 Multiple portfolio support
- 🔄 Advanced analytics
- 🔄 Price alerts
- 🔄 Export functionality

### Phase 3: Advanced Features (Q2 2026)

- 📝 Tax reporting
- 🔍 Advanced search
- 🏆 Performance tracking
- 🤖 AI-powered insights

---

## 6. Success Criteria

### Technical

- [ ] API response time < 2 seconds
- [ ] Mobile responsive on all devices
- [ ] Data persistence 100%
- [ ] Update frequency configurable

### User Experience

- [ ] Transaction tracking success rate > 95%
- [ ] Portfolio accuracy > 95%
- [ ] User satisfaction > 4.5/5
- [ ] Session retention > 70%

### Business

- [ ] 50+ daily active users
- [ ] 100+ transactions tracked per day
- [ ] 10+ holdings per user
- [ ] 90% uptime for crypto APIs

---

## 7. Risks & Mitigations

### Risk 1: Crypto API Limits

**Risk:** API rate limits or quota exhaustion

**Mitigation:**
- Implement request throttling
- Cache common responses
- Graceful degradation

### Risk 2: Data Accuracy

**Risk:** Incorrect or outdated market data

**Mitigation:**
- Multiple API sources
- Data validation
- Update frequency configuration

### Risk 3: Data Loss

**Risk:** LocalStorage data loss

**Mitigation:**
- Export functionality
- Backup reminders
- Data validation

---

## 8. Dependencies

### External Services

- **CoinGecko API**: Cryptocurrency market data (API key optional)
- **CoinMarketCap API**: Alternative market data source (API key optional)

### Libraries

- `react`, `react-dom`: UI framework
- `typescript`: Type safety

---

## 9. Appendix

### A. Environment Variables

```env
# Crypto APIs (Optional)
COINGECKO_API_KEY=your_coingecko_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### B. Installation Instructions

```bash
# Clone the repository
git clone https://github.com/magnusfroste/crypto-ledger.git
cd crypto-ledger

# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

### C. Getting API Keys (Optional)

1. Go to [CoinGecko](https://www.coingecko.com/api)
2. Create a new API key
3. Add to `.env.local` file
4. Restart development server

---

**Document History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 2026 | Initial PRD creation | Magnus Froste |

---

**License:** MIT - See LICENSE file for details

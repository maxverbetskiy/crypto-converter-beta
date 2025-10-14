// api.js - CryptoCompare API client using end-of-day close price

class CryptoAPI {
    constructor() {
        this.requestQueue = [];
        this.isProcessing = false;
        this.rateLimitDelay = CONFIG.RATE_LIMIT_DELAY; // e.g., 300 ms
        this.apiBase = CONFIG.CRYPTOCOMPARE_BASE_URL;  // "https://min-api.cryptocompare.com/data/v2"
        this.stats = { totalRequests: 0, successfulRequests: 0, failedRequests: 0 };
        this.stablecoins = new Set(['USDT','USDC','DAI','BUSD','TUSD','FRAX']);
    }

    async getHistoricalPrice(symbol, date) {
        return new Promise(resolve => {
            this.requestQueue.push({ symbol, date, resolve });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        this.isProcessing = true;
        while (this.requestQueue.length > 0) {
            const { symbol, date, resolve } = this.requestQueue.shift();
            try {
                this.stats.totalRequests++;
                const result = await this.fetchPrice(symbol, date);
                if (result) this.stats.successfulRequests++;
                else this.stats.failedRequests++;
                resolve(result);
                if (this.requestQueue.length > 0) {
                    await this.delay(this.rateLimitDelay);
                }
            } catch {
                this.stats.failedRequests++;
                resolve(null);
            }
        }
        this.isProcessing = false;
    }

    async fetchPrice(symbol, date) {
        const sym = symbol.toUpperCase();
        // Stablecoin always $1.00
        if (this.stablecoins.has(sym)) {
            return { price: 1.00, source: 'stablecoin', symbol: sym, date };
        }
        // Calculate end-of-day timestamp (23:59:59)
        const d = new Date(date);
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const endOfDayTs = Math.floor((startOfDay + 86399 * 1000) / 1000);

        const url = `${this.apiBase}/histoday?fsym=${sym}&tsym=USD&limit=1&toTs=${endOfDayTs}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.Response === 'Error') throw new Error(data.Message || 'API Error');

        const dayData = data.Data.Data[0];
        const close = dayData.close;
        if (!close || close <= 0) throw new Error('Invalid close price');

        return {
            price: close,
            source: 'cryptocompare',
            symbol: sym,
            date: date,
            ohlc: {
                open: dayData.open,
                high: dayData.high,
                low: dayData.low,
                close: dayData.close
            },
            volume: dayData.volumeto,
            timestamp: dayData.time
        };
    }

    delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }
}

// Create global instance
window.cryptoAPI = new CryptoAPI();

// Optional: test connection
window.cryptoAPI.getHistoricalPrice('BTC', '2023-10-23').then(console.log);

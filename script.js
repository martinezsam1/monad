// monad_bridge_fixed_full.js
// Full fixed & optimized Bridge Script with proper logos and dark mode

// ==============================
// GLOBAL STATE & CONFIGURATION
// ==============================

// Theme toggle
const toggle = document.getElementById('themeToggle');
const body = document.body;

// Check saved theme
const saved = localStorage.getItem('theme') === 'dark';
if (saved) body.classList.add('dark');

// Toggle theme
if (toggle) {
    toggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    });
}

const FALLBACK_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2QzVDRTciIGZpbGwtb3BhY2l0eT0iMC4xIi8+CjxwYXRoIGQ9Ik0yMCAxMkwyOCAyMEwyMCAyOEwxMiAyMEwyMCAxMloiIHN0cm9rZT0iIzZDNUNFNyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjQiIGZpbGw9IiM2QzVDRTciLz4KPC9zdmc+';

// ==============================
// NETWORKS & TOKEN CONFIG (Updated with correct logos)
// ==============================

const NETWORKS = {
    ethereum: { 
        name: 'Ethereum', 
        gecko: 'eth', 
        trustWallet: 'ethereum', 
        native: 'ETH', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' 
    },
    arbitrum: { 
        name: 'Arbitrum', 
        gecko: 'arbitrum', 
        trustWallet: 'arbitrum', 
        native: 'ETH', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png' 
    },
    optimism: { 
        name: 'Optimism', 
        gecko: 'optimism', 
        trustWallet: 'optimism', 
        native: 'ETH', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png' 
    },
    base: { 
        name: 'Base', 
        gecko: 'base', 
        trustWallet: 'base', 
        native: 'ETH', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png' 
    },
    bnb: { 
        name: 'BNB Chain', 
        gecko: 'bsc', 
        trustWallet: 'smartchain', 
        native: 'BNB', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png' 
    },
    polygon: { 
        name: 'Polygon', 
        gecko: 'polygon_pos', 
        trustWallet: 'polygon', 
        native: 'MATIC', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png' 
    },
    avalanche: { 
        name: 'Avalanche', 
        gecko: 'avax', 
        trustWallet: 'avalanchec', 
        native: 'AVAX', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png' 
    },
    solana: { 
        name: 'Solana', 
        gecko: 'solana', 
        trustWallet: 'solana', 
        native: 'SOL', 
        icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png' 
    },
    monad: { 
        name: 'Monad', 
        gecko: null, 
        trustWallet: null, 
        native: 'MON', 
        icon: 'images/monad_logo.png'
    }
};

// COMPREHENSIVE TOKEN CONFIG with all stablecoins and correct logos
const TOKEN_CONFIG = {
    // ============ ETHEREUM ============
    ETH: { 
        name: 'Ether', 
        symbol: 'ETH', 
        chain: 'ethereum', 
        gecko_network: 'eth', 
        contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
        icon: NETWORKS.ethereum.icon, 
        fallbackPrice: 3000 
    },
    ETH_USDT: { 
        name: 'Tether', 
        symbol: 'USDT', 
        chain: 'ethereum', 
        gecko_network: 'eth', 
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    ETH_USDC: { 
        name: 'USD Coin', 
        symbol: 'USDC', 
        chain: 'ethereum', 
        gecko_network: 'eth', 
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9eb0cE3606eB48', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    ETH_DAI: { 
        name: 'Dai', 
        symbol: 'DAI', 
        chain: 'ethereum', 
        gecko_network: 'eth', 
        contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
        icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    ETH_USDe: { 
        name: 'USDe', 
        symbol: 'USDe', 
        chain: 'ethereum', 
        gecko_network: 'eth', 
        contractAddress: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', // Using USDC icon as fallback
        fallbackPrice: 1, 
        isStable: true 
    },
    
    // Ethereum Custom Tokens
    ETH_ETHERUME: {
        name: 'Etherume',
        symbol: 'ETHERUME',
        chain: 'ethereum',
        gecko_network: 'eth',
        contractAddress: '0x0000000000000000000000000000000000000000',
        icon: NETWORKS.ethereum.icon,
        fallbackPrice: 0.001
    },
    ETH_ABR: {
        name: 'ABR',
        symbol: 'ABR',
        chain: 'ethereum',
        gecko_network: 'eth',
        contractAddress: '0x0000000000000000000000000000000000000000',
        icon: NETWORKS.ethereum.icon,
        fallbackPrice: 0.001
    },

    // ============ ARBITRUM ============
    ARB_ETH: { 
        name: 'Ether (Arbitrum)', 
        symbol: 'ETH', 
        chain: 'arbitrum', 
        gecko_network: 'arbitrum', 
        contractAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', 
        icon: NETWORKS.arbitrum.icon, 
        fallbackPrice: 3000 
    },
    ARB_USDT: { 
        name: 'Tether (Arbitrum)', 
        symbol: 'USDT', 
        chain: 'arbitrum', 
        gecko_network: 'arbitrum', 
        contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    ARB_USDC: { 
        name: 'USD Coin (Arbitrum)', 
        symbol: 'USDC', 
        chain: 'arbitrum', 
        gecko_network: 'arbitrum', 
        contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    ARB_USDCe: { 
        name: 'USD Coin (Bridged)', 
        symbol: 'USDC.e', 
        chain: 'arbitrum', 
        gecko_network: 'arbitrum', 
        contractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ OPTIMISM ============
    OP_ETH: { 
        name: 'Ether (Optimism)', 
        symbol: 'ETH', 
        chain: 'optimism', 
        gecko_network: 'optimism', 
        contractAddress: '0x4200000000000000000000000000000000000006', 
        icon: NETWORKS.optimism.icon, 
        fallbackPrice: 3000 
    },
    OP_USDT: { 
        name: 'Tether (Optimism)', 
        symbol: 'USDT', 
        chain: 'optimism', 
        gecko_network: 'optimism', 
        contractAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    OP_USDC: { 
        name: 'USD Coin (Optimism)', 
        symbol: 'USDC', 
        chain: 'optimism', 
        gecko_network: 'optimism', 
        contractAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ BASE ============
    BASE_ETH: { 
        name: 'Ether (Base)', 
        symbol: 'ETH', 
        chain: 'base', 
        gecko_network: 'base', 
        contractAddress: '0x4200000000000000000000000000000000000006', 
        icon: NETWORKS.base.icon, 
        fallbackPrice: 3000 
    },
    BASE_USDT: { 
        name: 'Tether (Base)', 
        symbol: 'USDT', 
        chain: 'base', 
        gecko_network: 'base', 
        contractAddress: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    BASE_USDC: { 
        name: 'USD Coin (Base)', 
        symbol: 'USDC', 
        chain: 'base', 
        gecko_network: 'base', 
        contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    BASE_DAI: { 
        name: 'Dai (Base)', 
        symbol: 'DAI', 
        chain: 'base', 
        gecko_network: 'base', 
        contractAddress: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', 
        icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ BNB CHAIN ============
    BNB_BNB: { 
        name: 'BNB', 
        symbol: 'BNB', 
        chain: 'bnb', 
        gecko_network: 'bsc', 
        contractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 
        icon: NETWORKS.bnb.icon, 
        fallbackPrice: 350 
    },
    BNB_USDT: { 
        name: 'Tether (BSC)', 
        symbol: 'USDT', 
        chain: 'bnb', 
        gecko_network: 'bsc', 
        contractAddress: '0x55d398326f99059fF775485246999027B3197955', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    BNB_USDC: { 
        name: 'USD Coin (BSC)', 
        symbol: 'USDC', 
        chain: 'bnb', 
        gecko_network: 'bsc', 
        contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    BNB_BUSD: { 
        name: 'Binance USD', 
        symbol: 'BUSD', 
        chain: 'bnb', 
        gecko_network: 'bsc', 
        contractAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', 
        icon: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ POLYGON ============
    POLY_MATIC: { 
        name: 'Polygon', 
        symbol: 'MATIC', 
        chain: 'polygon', 
        gecko_network: 'polygon_pos', 
        contractAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', 
        icon: NETWORKS.polygon.icon, 
        fallbackPrice: 0.6 
    },
    POLY_USDT: { 
        name: 'Tether (Polygon)', 
        symbol: 'USDT', 
        chain: 'polygon', 
        gecko_network: 'polygon_pos', 
        contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    POLY_USDC: { 
        name: 'USD Coin (Polygon)', 
        symbol: 'USDC', 
        chain: 'polygon', 
        gecko_network: 'polygon_pos', 
        contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ AVALANCHE ============
    AVAX_AVAX: { 
        name: 'Avalanche', 
        symbol: 'AVAX', 
        chain: 'avalanche', 
        gecko_network: 'avax', 
        contractAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', 
        icon: NETWORKS.avalanche.icon, 
        fallbackPrice: 30 
    },
    AVAX_USDT: { 
        name: 'Tether (Avalanche)', 
        symbol: 'USDT', 
        chain: 'avalanche', 
        gecko_network: 'avax', 
        contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    AVAX_USDC: { 
        name: 'USD Coin (Avalanche)', 
        symbol: 'USDC', 
        chain: 'avalanche', 
        gecko_network: 'avax', 
        contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    AVAX_USDCe: { 
        name: 'USD Coin (Bridged)', 
        symbol: 'USDC.e', 
        chain: 'avalanche', 
        gecko_network: 'avax', 
        contractAddress: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ SOLANA ============
    SOL_SOL: { 
        name: 'Solana', 
        symbol: 'SOL', 
        chain: 'solana', 
        gecko_network: 'solana', 
        contractAddress: 'So11111111111111111111111111111111111111112', 
        icon: NETWORKS.solana.icon, 
        fallbackPrice: 120 
    },
    SOL_USDC: { 
        name: 'USD Coin (Solana)', 
        symbol: 'USDC', 
        chain: 'solana', 
        gecko_network: 'solana', 
        contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 
        icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },
    SOL_USDT: { 
        name: 'Tether (Solana)', 
        symbol: 'USDT', 
        chain: 'solana', 
        gecko_network: 'solana', 
        contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', 
        fallbackPrice: 1, 
        isStable: true 
    },

    // ============ MONAD ============
    MON_MON: { 
        name: 'Monad', 
        symbol: 'MON', 
        chain: 'monad', 
        gecko_network: null,
        contractAddress: null, 
        icon: NETWORKS.monad.icon, // Using Monad network icon
        fallbackPrice: 0.02453 
    }
};

// Per-chain token lists with all stablecoins
const TOKENS_BY_CHAIN = {
    ethereum: ['ETH', 'ETH_USDT', 'ETH_USDC', 'ETH_DAI', 'ETH_USDe', 'ETH_ETHERUME', 'ETH_ABR'],
    arbitrum: ['ARB_ETH', 'ARB_USDT', 'ARB_USDC', 'ARB_USDCe'],
    optimism: ['OP_ETH', 'OP_USDT', 'OP_USDC'],
    base: ['BASE_ETH', 'BASE_USDT', 'BASE_USDC', 'BASE_DAI'],
    bnb: ['BNB_BNB', 'BNB_USDT', 'BNB_USDC', 'BNB_BUSD'],
    polygon: ['POLY_MATIC', 'POLY_USDT', 'POLY_USDC'],
    avalanche: ['AVAX_AVAX', 'AVAX_USDT', 'AVAX_USDC', 'AVAX_USDCe'],
    solana: ['SOL_SOL', 'SOL_USDC', 'SOL_USDT'],
    monad: ['MON_MON']
};

// ==============================
// APP STATE
// ==============================

let currentFromToken = { symbol: 'SOL', price: TOKEN_CONFIG.SOL_SOL.fallbackPrice, logo: TOKEN_CONFIG.SOL_SOL.icon, chain: 'solana', config: TOKEN_CONFIG.SOL_SOL };
let currentToToken = { symbol: 'MON', price: TOKEN_CONFIG.MON_MON.fallbackPrice, logo: TOKEN_CONFIG.MON_MON.icon, chain: 'monad', config: TOKEN_CONFIG.MON_MON };
let currentChain = 'ethereum';
let currentBtn = null;
let currentIcon = null;
let selectedTokenList = [];
let refreshInterval = null;

// ==============================
// ENHANCED PRICE SERVICE
// ==============================

class PriceService {
    constructor() {
        this.cacheTTL = 50000; // 50 seconds cache
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    _cacheKey(chain, address) {
        return `${chain || 'unknown'}:${address || 'noaddr'}`;
    }

    _setCache(key, value) {
        this.cache.set(key, { value, t: Date.now() });
    }

    _getCache(key) {
        const r = this.cache.get(key);
        if (!r) return null;
        if (Date.now() - r.t > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        return r.value;
    }

    // GeckoTerminal with fixed network slugs
    async _fetchGeckoTerminal(chainSlug, contractAddress) {
        try {
            if (!chainSlug || !contractAddress) return null;
            
            const url = `https://api.geckoterminal.com/api/v2/simple/networks/${encodeURIComponent(chainSlug)}/token_price/${encodeURIComponent(contractAddress)}`;
            
            const res = await fetch(url);
            if (!res.ok) {
                console.log(`[PriceService] GeckoTerminal HTTP ${res.status} for ${chainSlug}/${contractAddress}`);
                return null;
            }
            
            const json = await res.json();
            const pricesObj = json?.data?.attributes?.token_prices || {};
            const priceVal = pricesObj[contractAddress] || pricesObj[Object.keys(pricesObj)[0]];
            
            if (priceVal) {
                const price = parseFloat(priceVal);
                return price;
            }
            
            return null;
        } catch (e) {
            console.log('[PriceService] GeckoTerminal fetch failed', e);
            return null;
        }
    }

    // DexScreener fallback
    async _fetchDexScreenerPrice(query) {
        try {
            const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}&limit=5`;
            
            const res = await fetch(url);
            if (!res.ok) return null;
            
            const json = await res.json();
            if (json?.pairs && json.pairs.length) {
                const price = parseFloat(json.pairs[0].priceUsd);
                if (price && price > 0) {
                    return price;
                }
            }
            return null;
        } catch (e) {
            console.log('[PriceService] DexScreener fetch failed', e);
            return null;
        }
    }

    // CoinGecko as another fallback
    async _fetchCoinGeckoPrice(symbol) {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`;
            const res = await fetch(url);
            if (!res.ok) return null;
            
            const json = await res.json();
            return json[symbol.toLowerCase()]?.usd || null;
        } catch (e) {
            console.log('[PriceService] CoinGecko fetch failed', e);
            return null;
        }
    }

    // Main price fetching with multiple fallbacks
    async getPriceForTokenConfig(tokenCfg, force = false) {
        if (!tokenCfg) return tokenCfg?.fallbackPrice || 0;
        
        const key = this._cacheKey(tokenCfg.gecko_network || tokenCfg.chain, tokenCfg.contractAddress || tokenCfg.symbol);
        
        // Check if already loading
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        // Check cache
        if (!force) {
            const cached = this._getCache(key);
            if (cached !== null) return cached;
        }
        
        // Create loading promise
        const pricePromise = (async () => {
            let price = null;
            
            // For stablecoins, return fallback price immediately
            if (tokenCfg.isStable) {
                price = tokenCfg.fallbackPrice || 1;
                this._setCache(key, price);
                return price;
            }
            
            // Strategy 1: GeckoTerminal (for supported chains)
            if (tokenCfg.gecko_network && tokenCfg.contractAddress) {
                price = await this._fetchGeckoTerminal(tokenCfg.gecko_network, tokenCfg.contractAddress);
            }
            
            // Strategy 2: For Monad specifically
            if ((price === null || price === 0) && tokenCfg.symbol === 'MON') {
                // Try CoinGecko first
                price = await this._fetchCoinGeckoPrice('monad');
                
                // Try DexScreener
                if (!price) {
                    price = await this._fetchDexScreenerPrice('monad');
                }
            }
            
            // Strategy 3: DexScreener search for other tokens
            if ((price === null || price === 0) && tokenCfg.symbol) {
                const searchQuery = tokenCfg.contractAddress || `${tokenCfg.symbol} ${tokenCfg.chain}`;
                price = await this._fetchDexScreenerPrice(searchQuery);
            }
            
            // Strategy 4: For AVAX specifically if still failing
            if ((price === null || price === 0) && tokenCfg.symbol === 'AVAX') {
                // Alternative AVAX price source
                price = await this._fetchDexScreenerPrice('AVAX avalanche');
            }
            
            // Final fallback
            if (!price || isNaN(price) || price === 0) {
                price = tokenCfg.fallbackPrice || 0;
            }
            
            // Cache the result
            this._setCache(key, price);
            this.loadingPromises.delete(key);
            
            return price;
        })();
        
        this.loadingPromises.set(key, pricePromise);
        return pricePromise;
    }

    // Preload all tokens
    async preloadAllTokens() {
        console.log('[PriceService] Preloading all token prices...');
        
        const preloadPromises = [];
        
        for (const [symbol, config] of Object.entries(TOKEN_CONFIG)) {
            if (config) {
                preloadPromises.push(
                    this.getPriceForTokenConfig(config).catch(() => config.fallbackPrice || 0)
                );
            }
        }
        
        await Promise.allSettled(preloadPromises);
        console.log('[PriceService] All prices preloaded');
    }

    // Update current tokens
    async updateCurrentTokens() {
        try {
            const fromCfg = currentFromToken.config || TOKEN_CONFIG[currentFromToken.symbol];
            const toCfg = currentToToken.config || TOKEN_CONFIG[currentToToken.symbol];
            
            if (!fromCfg || !toCfg) {
                console.log('[PriceService] Missing token config');
                return;
            }
            
            const [fromPrice, toPrice] = await Promise.all([
                this.getPriceForTokenConfig(fromCfg, true),
                this.getPriceForTokenConfig(toCfg, true)
            ]);
            
            if (fromPrice) currentFromToken.price = fromPrice;
            if (toPrice) currentToToken.price = toPrice;
            
            updateCalculation();
            updateTokenListPrices();
            
            // Update timestamp
            const now = new Date();
            const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            console.log(`[PriceService] Prices updated at ${timeString}`);
        } catch (e) {
            console.error('[PriceService] updateCurrentTokens failed', e);
        }
    }
}

const priceService = new PriceService();

// ==============================
// ENHANCED LOGO SERVICE
// ==============================

class LogoService {
    constructor() { 
        this.cache = new Map(); 
    }
    
    async getLogo(symbol, chain = null) {
        const cacheKey = `${symbol}-${chain}`;
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
        
        // Try to find token config
        const tokenKey = Object.keys(TOKEN_CONFIG).find(key => 
            TOKEN_CONFIG[key].symbol === symbol
        );
        
        if (tokenKey && TOKEN_CONFIG[tokenKey]?.icon) {
            const logo = TOKEN_CONFIG[tokenKey].icon;
            this.cache.set(cacheKey, logo);
            return logo;
        }
        
        // Fallback to chain icon
        if (chain && NETWORKS[chain]?.icon) {
            this.cache.set(cacheKey, NETWORKS[chain].icon);
            return NETWORKS[chain].icon;
        }
        
        // Ultimate fallback
        this.cache.set(cacheKey, FALLBACK_LOGO_URL);
        return FALLBACK_LOGO_URL;
    }
    
    async getChainLogo(chain) {
        return NETWORKS[chain]?.icon || FALLBACK_LOGO_URL;
    }
}

const logoService = new LogoService();

// ==============================
// MODAL/POPUP MANAGER
// ==============================

class ModalManager {
    constructor() {
        this.modal = document.getElementById('tokenModal');
        this.backdrop = document.getElementById('modalBackdrop');
        this.closeBtn = document.getElementById('closeModalBtn');
        this.searchInput = document.getElementById('tokenSearch');
        this.searchBtn = document.getElementById('searchTokenBtn');
        this.tokenList = document.getElementById('tokenList');
        
        this.init();
    }
    
    init() {
        if (!this.modal) {
            console.error('Modal elements not found!');
            return;
        }
        
        // Close on backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) this.close();
            });
        }
        
        // Close on button click
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        
        // Search functionality
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.search());
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.search();
            });
            
            this.searchInput.addEventListener('input', () => {
                if (!this.searchInput.value.trim()) {
                    loadTokensForChain(currentChain);
                }
            });
        }
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    }
    
    open(btnType) {
        if (!this.modal) return;
        
        currentBtn = document.querySelector(`.${btnType}-btn`);
        currentIcon = document.querySelector(`.${btnType}-icon`);
        
        // Set active chain tab
        document.querySelectorAll('.chain-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.chain === currentChain);
        });
        
        // Load tokens for current chain
        loadTokensForChain(currentChain);
        
        // Show modal
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus search input
        if (this.searchInput) {
            setTimeout(() => this.searchInput.focus(), 100);
        }
    }
    
    close() {
        if (!this.modal) return;
        
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Clear search
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        currentBtn = null;
        currentIcon = null;
    }
    
    isOpen() {
        return this.modal?.style.display === 'flex';
    }
    
    async search() {
        const query = this.searchInput?.value.trim();
        if (!query || !this.tokenList) return;
        
        this.tokenList.innerHTML = '<div class="loading">Searching...</div>';
        
        // Simple local search first
        const localResults = selectedTokenList.filter(token => 
            token.symbol.toLowerCase().includes(query.toLowerCase()) ||
            token.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (localResults.length > 0) {
            renderTokenList(localResults);
            return;
        }
        
        // If no local results, try DexScreener
        try {
            const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}&limit=10`;
            const res = await fetch(url);
            
            if (!res.ok) {
                this.tokenList.innerHTML = '<div class="loading">Search failed</div>';
                return;
            }
            
            const data = await res.json();
            if (data.pairs && data.pairs.length > 0) {
                const tokens = data.pairs.slice(0, 5).map(pair => ({
                    symbol: pair.baseToken?.symbol?.toUpperCase() || 'TOKEN',
                    name: pair.baseToken?.name || 'Unknown Token',
                    chain: this.mapChain(pair.chainId),
                    price: parseFloat(pair.priceUsd) || 0,
                    logo: pair.info?.imageUrl || FALLBACK_LOGO_URL,
                    chainLogo: NETWORKS[this.mapChain(pair.chainId)]?.icon || FALLBACK_LOGO_URL,
                    address: pair.baseToken?.address
                }));
                
                renderTokenList(tokens);
            } else {
                this.tokenList.innerHTML = '<div class="loading">No tokens found</div>';
            }
        } catch (error) {
            console.error('Search error:', error);
            this.tokenList.innerHTML = '<div class="loading">Search error</div>';
        }
    }
    
    mapChain(chainId) {
        if (!chainId) return 'ethereum';
        const id = chainId.toLowerCase();
        
        if (id.includes('bsc')) return 'bnb';
        if (id.includes('polygon')) return 'polygon';
        if (id.includes('avalanche')) return 'avalanche';
        if (id.includes('arbitrum')) return 'arbitrum';
        if (id.includes('optimism')) return 'optimism';
        if (id.includes('base')) return 'base';
        if (id.includes('solana')) return 'solana';
        if (id.includes('monad')) return 'monad';
        
        return 'ethereum';
    }
}

let modalManager;

// ==============================
// HELPER FUNCTIONS
// ==============================

function formatPrice(price) {
    if (!price || price === 0) return '0.00';
    
    // For very small prices
    if (price < 0.000001) return price.toExponential(4);
    if (price < 0.001) return price.toFixed(8);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 1000) return price.toFixed(2);
    
    // For large prices with M suffix
    if (price < 1000000) return (price / 1000).toFixed(2) + 'K';
    if (price < 1000000000) return (price / 1000000).toFixed(2) + 'M';
    return (price / 1000000000).toFixed(2) + 'B';
}

function updateTokenListPrices() {
    document.querySelectorAll('.token-item').forEach(item => {
        const symbol = item.dataset.symbol;
        if (!symbol) return;
        
        // Get price from current tokens or config
        let price = 0;
        if (symbol === currentFromToken.symbol) price = currentFromToken.price;
        else if (symbol === currentToToken.symbol) price = currentToToken.price;
        else {
            // Find token in TOKEN_CONFIG
            const tokenKey = Object.keys(TOKEN_CONFIG).find(key => 
                TOKEN_CONFIG[key].symbol === symbol
            );
            if (tokenKey) {
                // Use cached price if available
                const cacheKey = priceService._cacheKey(
                    TOKEN_CONFIG[tokenKey].gecko_network || TOKEN_CONFIG[tokenKey].chain,
                    TOKEN_CONFIG[tokenKey].contractAddress || TOKEN_CONFIG[tokenKey].symbol
                );
                const cached = priceService._getCache(cacheKey);
                price = cached || TOKEN_CONFIG[tokenKey].fallbackPrice || 0;
            }
        }
        
        const priceEl = item.querySelector('.token-price > div');
        if (priceEl) {
            priceEl.textContent = `$${formatPrice(price)}`;
        }
    });
}

async function renderTokenList(tokens) {
    const container = document.getElementById('tokenList');
    if (!container) return;
    
    if (!tokens || tokens.length === 0) {
        container.innerHTML = '<div class="loading">No tokens found</div>';
        return;
    }
    
    container.innerHTML = '';
    
    for (const token of tokens) {
        const el = document.createElement('div');
        el.className = 'token-item';
        el.dataset.symbol = token.symbol;
        el.dataset.chain = token.chain || '';
        
        // Get logos
        const chainLogo = token.chainLogo || await logoService.getChainLogo(token.chain);
        const tokenLogo = token.logo || await logoService.getLogo(token.symbol, token.chain);
        
        el.innerHTML = `
            <div class="token-icon-container">
                <img src="${tokenLogo}" alt="${token.symbol}" 
                     onerror="this.onerror=null;this.src='${FALLBACK_LOGO_URL}'"/>
                <div class="token-chain-badge">
                    <img src="${chainLogo}" alt="${token.chain || ''}"
                         onerror="this.onerror=null;this.src='${FALLBACK_LOGO_URL}'"/>
                </div>
            </div>
            <div class="token-info">
                <h4>${token.symbol}</h4>
                <p>${token.name || ''}</p>
            </div>
            <div class="token-price">
                <div>$${formatPrice(token.price || 0)}</div>
            </div>
        `;
        
        el.addEventListener('click', () => selectToken(token));
        container.appendChild(el);
    }
}

async function selectToken(token) {
    if (!currentBtn || !currentIcon) return;
    
    // Update button text
    const span = currentBtn.querySelector('span');
    if (span) span.textContent = token.symbol;
    
    // Update icon
    const chainLogo = await logoService.getChainLogo(token.chain);
    const tokenLogo = token.logo || await logoService.getLogo(token.symbol, token.chain);
    
    currentIcon.innerHTML = `
        <img src="${tokenLogo}" alt="${token.symbol}" 
             onerror="this.onerror=null;this.src='${FALLBACK_LOGO_URL}'"/>
        <div class="chain-badge">
            <img src="${chainLogo}" alt="${token.chain || ''}"
                 onerror="this.onerror=null;this.src='${FALLBACK_LOGO_URL}'"/>
        </div>
    `;
    
    // Find the token config
    const tokenKey = Object.keys(TOKEN_CONFIG).find(key => 
        TOKEN_CONFIG[key].symbol === token.symbol
    );
    
    const cfg = tokenKey ? TOKEN_CONFIG[tokenKey] : {
        name: token.name,
        symbol: token.symbol,
        chain: token.chain,
        contractAddress: token.address,
        fallbackPrice: token.price || 0,
        icon: token.logo
    };
    
    const newState = {
        symbol: token.symbol,
        price: token.price || cfg.fallbackPrice || 0,
        logo: tokenLogo,
        chain: token.chain || cfg.chain,
        config: cfg
    };
    
    if (currentBtn.classList.contains('from-btn')) {
        currentFromToken = newState;
    } else {
        currentToToken = newState;
    }
    
    // Fetch fresh price
    try {
        const freshPrice = await priceService.getPriceForTokenConfig(cfg, true);
        if (currentBtn.classList.contains('from-btn')) {
            currentFromToken.price = freshPrice || currentFromToken.price;
        } else {
            currentToToken.price = freshPrice || currentToToken.price;
        }
    } catch (error) {
        console.error('Error fetching fresh price:', error);
    }
    
    updateCalculation();
    modalManager.close();
}

async function loadTokensForChain(chain) {
    const listEl = document.getElementById('tokenList');
    if (!listEl) return;
    
    listEl.innerHTML = '<div class="loading">Loading tokens...</div>';
    
    const tokenSymbols = TOKENS_BY_CHAIN[chain] || [];
    const result = [];
    
    // Load prices for all tokens in parallel
    const pricePromises = tokenSymbols.map(async (sym) => {
        const cfg = TOKEN_CONFIG[sym];
        if (!cfg) return null;
        
        const price = await priceService.getPriceForTokenConfig(cfg);
        const logo = await logoService.getLogo(cfg.symbol, chain);
        const chainLogo = await logoService.getChainLogo(chain);
        
        return {
            symbol: cfg.symbol,
            name: cfg.name,
            chain: cfg.chain,
            price,
            logo,
            chainLogo,
            address: cfg.contractAddress
        };
    });
    
    const results = await Promise.all(pricePromises);
    selectedTokenList = results.filter(r => r !== null);
    
    renderTokenList(selectedTokenList);
}

function updateCalculation() {
    const fromInput = document.getElementById('fromAmount');
    if (!fromInput) return;
    
    const fromAmount = parseFloat(fromInput.value) || 0;
    const fromPrice = currentFromToken.price || 0;
    const toPrice = currentToToken.price || 0;
    
    const usdValue = fromAmount * fromPrice;
    let toAmount = 0;
    
    if (toPrice > 0) {
        toAmount = usdValue / toPrice;
    }
    
    // Update to amount input
    const toInput = document.getElementById('toAmount');
    if (toInput) {
        if (toAmount > 0) {
            toInput.value = toAmount < 0.01 ? toAmount.toFixed(8) : toAmount.toFixed(4);
        } else {
            toInput.value = '0';
        }
    }
    
    // Update price displays
    const fromPriceDisplay = document.getElementById('fromPriceDisplay');
    if (fromPriceDisplay) {
        fromPriceDisplay.textContent = `$${usdValue.toFixed(2)}`;
    }
    
    const toPriceDisplay = document.getElementById('toPriceDisplay');
    if (toPriceDisplay) {
        toPriceDisplay.textContent = `$${(toAmount * toPrice).toFixed(2)}`;
    }
    
    // Update conversion rate
    const rateEl = document.getElementById('conversion-rate');
    if (rateEl && fromPrice > 0 && toPrice > 0) {
        const rate = fromPrice / toPrice;
        rateEl.textContent = `1 ${currentFromToken.symbol} = ${formatPrice(rate)} ${currentToToken.symbol}`;
    }
}

function swapTokens() {
    // Swap tokens
    const temp = { ...currentFromToken };
    currentFromToken = { ...currentToToken };
    currentToToken = temp;
    
    // Update UI
    const fromSpan = document.querySelector('.from-btn span');
    const toSpan = document.querySelector('.to-btn span');
    if (fromSpan && toSpan) {
        const tempText = fromSpan.textContent;
        fromSpan.textContent = toSpan.textContent;
        toSpan.textContent = tempText;
    }
    
    const fromIcon = document.querySelector('.from-icon');
    const toIcon = document.querySelector('.to-icon');
    
    if (fromIcon && toIcon) {
        const tempHTML = fromIcon.innerHTML;
        fromIcon.innerHTML = toIcon.innerHTML;
        toIcon.innerHTML = tempHTML;
    }
    
    updateCalculation();
}

// ==============================
// INITIALIZATION
// ==============================

function setupEventListeners() {
    // Token selection buttons
    document.querySelector('.from-btn')?.addEventListener('click', () => modalManager.open('from'));
    document.querySelector('.to-btn')?.addEventListener('click', () => modalManager.open('to'));
    
    // Swap button
    document.getElementById('swapButton')?.addEventListener('click', swapTokens);
    
    // From amount input
    const fromInput = document.getElementById('fromAmount');
    if (fromInput) {
        fromInput.addEventListener('input', updateCalculation);
        fromInput.addEventListener('change', updateCalculation);
    }
    
    // Chain buttons
    document.querySelectorAll('.chain-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chain-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChain = btn.dataset.chain;
            loadTokensForChain(currentChain);
        });
    });
}

function startPriceRefresh() {
    // Clear existing interval if any
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Set up 50-second refresh interval
    refreshInterval = setInterval(() => {
        console.log('[Auto-Refresh] Refreshing prices...');
        priceService.updateCurrentTokens();
    }, 50000); // 50 seconds
    
    console.log('[Auto-Refresh] Price refresh interval set to 50 seconds');
}

async function initializeApp() {
    console.log('Initializing bridge with all stablecoins...');
    
    // Initialize modal manager
    modalManager = new ModalManager();
    
    // Setup event listeners
    setupEventListeners();
    
    // Set default amount
    const fromInput = document.getElementById('fromAmount');
    if (fromInput && !fromInput.value) {
        fromInput.value = '1';
    }
    
    // Preload all prices immediately
    console.log('Preloading all token prices...');
    await priceService.preloadAllTokens();
    
    // Update current tokens with fresh prices
    await priceService.updateCurrentTokens();
    
    // Start 50-second price refresh
    startPriceRefresh();
    
    // Initial token list load
    loadTokensForChain(currentChain);
    
    // Initial calculation
    updateCalculation();
    
    console.log('Bridge initialized successfully with all stablecoins');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(console.error);
});

// Make services available for debugging
window.priceService = priceService;
window.logoService = logoService;
window.TOKEN_CONFIG = TOKEN_CONFIG;
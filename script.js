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
toggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

// Token configuration with local fallback prices
const TOKEN_CONFIG = {
    'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        chain: 'solana',
        address: null,
        decimals: 9,
        coingeckoId: 'solana',
        binanceSymbol: 'SOLUSDT',
        icon: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        fallbackPrice: 124.00
    },
    'MON': {
        name: 'Monad',
        symbol: 'MON',
        chain: 'ethereum',
        address: '0x3bd359c1119da7da1d913d1c4d2b7c461115433a',
        decimals: 18,
        coingeckoId: 'monad',
        binanceSymbol: null,
        icon: 'images/monad_logo.png',
        fallbackPrice: 0.02453
    },
    'ETH': {
        name: 'Ethereum',
        symbol: 'ETH',
        chain: 'ethereum',
        address: null,
        decimals: 18,
        coingeckoId: 'ethereum',
        binanceSymbol: 'ETHUSDT',
        icon: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        fallbackPrice: 2500.00
    },
    'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        chain: 'ethereum',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        decimals: 6,
        coingeckoId: 'usd-coin',
        binanceSymbol: 'USDCUSDT',
        icon: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
        fallbackPrice: 1.00
    },
    'USDT': {
        name: 'Tether',
        symbol: 'USDT',
        chain: 'ethereum',
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        decimals: 6,
        coingeckoId: 'tether',
        binanceSymbol: 'USDTUSDT',
        icon: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        fallbackPrice: 1.00
    }
};

// Current state
let currentFromToken = {
    symbol: 'SOL',
    price: 124.00,
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    chain: 'solana',
    chainLogo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    address: null,
    config: TOKEN_CONFIG.SOL
};

let currentToToken = {
    symbol: 'MON',
    price: 0.02453,
    logo: 'images/monad_logo.png',
    chain: 'ethereum',
    chainLogo: 'images/monad_logo.png',
    address: '0x3bd359c1119da7da1d913d1c4d2b7c461115433a',
    config: TOKEN_CONFIG.MON
};

let currentChain = 'ethereum';
let currentBtn = null;
let currentIcon = null;
let selectedTokenList = [];

// ==============================
// PRICE SERVICE - LOCAL FRIENDLY
// ==============================

class PriceService {
    constructor() {
        this.priceCache = new Map();
        this.lastUpdate = 0;
        this.cacheDuration = 60000; // 1 minute cache
        
        // Initialize with fallback prices
        Object.keys(TOKEN_CONFIG).forEach(symbol => {
            if (TOKEN_CONFIG[symbol].fallbackPrice) {
                this.priceCache.set(symbol, TOKEN_CONFIG[symbol].fallbackPrice);
            }
        });
    }

    async getPrice(symbol, forceUpdate = false) {
        // Check cache first
        if (!forceUpdate && this.priceCache.has(symbol) && 
            Date.now() - this.lastUpdate < this.cacheDuration) {
            return this.priceCache.get(symbol);
        }

        const tokenConfig = TOKEN_CONFIG[symbol];
        if (!tokenConfig) {
            return 0;
        }

        let price = 0;
        
        try {
            // Try to fetch from multiple sources (with CORS proxy for local)
            price = await this.tryFetchPrice(symbol, tokenConfig);
        } catch (error) {
            console.log(`Failed to fetch price for ${symbol}, using fallback`);
            price = tokenConfig.fallbackPrice || 0;
        }

        // Update cache
        this.priceCache.set(symbol, price);
        this.lastUpdate = Date.now();
        
        return price;
    }

    async tryFetchPrice(symbol, tokenConfig) {
        const tokenName = tokenConfig.name.toLowerCase();
        
        // Method 1: Try direct fetch (works for some APIs)
        if (tokenConfig.binanceSymbol) {
            try {
                const price = await this.fetchBinancePrice(symbol);
                if (price > 0) return price;
            } catch (e) {}
        }

        // Method 2: Try CoinGecko via CORS proxy
        try {
            const price = await this.fetchCoinGeckoPrice(symbol, tokenConfig.coingeckoId);
            if (price > 0) return price;
        } catch (e) {}

        // Method 3: Try CoinGecko search (works better for some tokens)
        try {
            const price = await this.searchCoinGeckoPrice(symbol);
            if (price > 0) return price;
        } catch (e) {}

        // Method 4: Try DexScreener
        try {
            const price = await this.fetchDexScreenerPrice(symbol, tokenConfig.address);
            if (price > 0) return price;
        } catch (e) {}

        // Return fallback price
        return tokenConfig.fallbackPrice || 0;
    }

    async fetchBinancePrice(symbol) {
        // Binance API doesn't require CORS for some endpoints
        const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
        if (!response.ok) throw new Error('Binance API failed');
        const data = await response.json();
        return parseFloat(data.price);
    }

    async fetchCoinGeckoPrice(symbol, coingeckoId) {
        if (!coingeckoId) throw new Error('No CoinGecko ID');
        
        // Use CORS proxy for CoinGecko when running locally
        const proxyUrl = 'https://corsproxy.io/?';
        const url = `${proxyUrl}https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('CoinGecko API failed');
        const data = await response.json();
        return data[coingeckoId]?.usd || 0;
    }

    async searchCoinGeckoPrice(symbol) {
        const proxyUrl = 'https://corsproxy.io/?';
        const searchUrl = `${proxyUrl}https://api.coingecko.com/api/v3/search?query=${symbol}`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) throw new Error('CoinGecko search failed');
        const data = await response.json();
        
        if (data.coins && data.coins.length > 0) {
            const coin = data.coins[0];
            const priceUrl = `${proxyUrl}https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`;
            const priceResponse = await fetch(priceUrl);
            const priceData = await priceResponse.json();
            return priceData[coin.id]?.usd || 0;
        }
        
        return 0;
    }

    async fetchDexScreenerPrice(symbol, address) {
        const proxyUrl = 'https://corsproxy.io/?';
        let url = '';
        
        if (address) {
            url = `${proxyUrl}https://api.dexscreener.com/latest/dex/tokens/${address}`;
        } else {
            url = `${proxyUrl}https://api.dexscreener.com/latest/dex/search?q=${symbol}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('DexScreener API failed');
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            return parseFloat(pair.priceUsd) || 0;
        }
        
        return 0;
    }

    async updateAllPrices() {
        const symbols = [currentFromToken.symbol, currentToToken.symbol];
        
        for (const symbol of symbols) {
            try {
                const price = await this.getPrice(symbol, true);
                
                if (symbol === currentFromToken.symbol) {
                    currentFromToken.price = price;
                } else {
                    currentToToken.price = price;
                }
            } catch (error) {
                console.error(`Failed to update price for ${symbol}:`, error);
            }
        }
        
        updateCalculation();
    }
}

// Initialize price service
const priceService = new PriceService();

// ==============================
// TOP TOKENS BY NETWORK (20+ tokens each)
// ==============================

const CHAIN_TOKENS = {
    ethereum: [
        { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
        { symbol: 'USDT', name: 'Tether', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin' },
        { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
        { symbol: 'XRP', name: 'XRP', coingeckoId: 'ripple' },
        { symbol: 'ADA', name: 'Cardano', coingeckoId: 'cardano' },
        { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin' },
        { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
        { symbol: 'TRX', name: 'TRON', coingeckoId: 'tron' },
        { symbol: 'DOT', name: 'Polkadot', coingeckoId: 'polkadot' },
        { symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
        { symbol: 'SHIB', name: 'Shiba Inu', coingeckoId: 'shiba-inu' },
        { symbol: 'DAI', name: 'Dai', coingeckoId: 'dai' },
        { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin', coingeckoId: 'wrapped-bitcoin' },
        { symbol: 'UNI', name: 'Uniswap', coingeckoId: 'uniswap' },
        { symbol: 'LINK', name: 'Chainlink', coingeckoId: 'chainlink' },
        { symbol: 'LEO', name: 'LEO Token', coingeckoId: 'leo-token' },
        { symbol: 'ATOM', name: 'Cosmos', coingeckoId: 'cosmos' },
        { symbol: 'ETC', name: 'Ethereum Classic', coingeckoId: 'ethereum-classic' }
    ],
    solana: [
        { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
        { symbol: 'USDT', name: 'Tether (Solana)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (Solana)', coingeckoId: 'usd-coin' },
        { symbol: 'BONK', name: 'Bonk', coingeckoId: 'bonk' },
        { symbol: 'WIF', name: 'dogwifhat', coingeckoId: 'dogwifcoin' },
        { symbol: 'JUP', name: 'Jupiter', coingeckoId: 'jupiter-exchange-solana' },
        { symbol: 'RAY', name: 'Raydium', coingeckoId: 'raydium' },
        { symbol: 'PYTH', name: 'Pyth Network', coingeckoId: 'pyth-network' },
        { symbol: 'JTO', name: 'Jito', coingeckoId: 'jito-governance-token' },
        { symbol: 'MSOL', name: 'Marinade Staked SOL', coingeckoId: 'marinade-staked-sol' },
        { symbol: 'BOME', name: 'BOOK OF MEME', coingeckoId: 'book-of-meme' },
        { symbol: 'POPCAT', name: 'Popcat', coingeckoId: 'popcat' },
        { symbol: 'WEN', name: 'Wen', coingeckoId: 'wen-2' },
        { symbol: 'MYRO', name: 'Myro', coingeckoId: 'myro' },
        { symbol: 'HNT', name: 'Helium', coingeckoId: 'helium' },
        { symbol: 'MOBILE', name: 'Helium Mobile', coingeckoId: 'helium-mobile' },
        { symbol: 'IOT', name: 'Helium IOT', coingeckoId: 'helium-iot' },
        { symbol: 'RNDR', name: 'Render Token', coingeckoId: 'render-token' },
        { symbol: 'ORCA', name: 'Orca', coingeckoId: 'orca' },
        { symbol: 'SAMO', name: 'Samoyedcoin', coingeckoId: 'samoyedcoin' }
    ],
    monad: [
        { symbol: 'MON', name: 'Monad', coingeckoId: 'monad' },
        { symbol: 'USDT', name: 'Tether (Monad)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (Monad)', coingeckoId: 'usd-coin' },
        { symbol: 'ETH', name: 'Ethereum (Monad)', coingeckoId: 'ethereum' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin (Monad)', coingeckoId: 'wrapped-bitcoin' },
        { symbol: 'DAI', name: 'Dai (Monad)', coingeckoId: 'dai' }
    ],
    arbitrum: [
        { symbol: 'ETH', name: 'Ethereum (Arbitrum)', coingeckoId: 'ethereum' },
        { symbol: 'USDT', name: 'Tether (Arbitrum)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (Arbitrum)', coingeckoId: 'usd-coin' },
        { symbol: 'ARB', name: 'Arbitrum', coingeckoId: 'arbitrum' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin (Arbitrum)', coingeckoId: 'wrapped-bitcoin' },
        { symbol: 'GMX', name: 'GMX', coingeckoId: 'gmx' },
        { symbol: 'RDNT', name: 'Radiant Capital', coingeckoId: 'radiant-capital' },
        { symbol: 'MAGIC', name: 'MAGIC', coingeckoId: 'magic' },
        { symbol: 'GNS', name: 'Gains Network', coingeckoId: 'gains-network' },
        { symbol: 'STG', name: 'Stargate Finance', coingeckoId: 'stargate-finance' },
        { symbol: 'VELA', name: 'Vela Exchange', coingeckoId: 'vela-exchange' },
        { symbol: 'DPX', name: 'Dopex', coingeckoId: 'dopex' },
        { symbol: 'PLS', name: 'Plutus', coingeckoId: 'plutusdao' },
        { symbol: 'JONES', name: 'Jones DAO', coingeckoId: 'jones-dao' },
        { symbol: 'LINK', name: 'Chainlink (Arbitrum)', coingeckoId: 'chainlink' },
        { symbol: 'UNI', name: 'Uniswap (Arbitrum)', coingeckoId: 'uniswap' },
        { symbol: 'AAVE', name: 'Aave (Arbitrum)', coingeckoId: 'aave' },
        { symbol: 'CRV', name: 'Curve DAO (Arbitrum)', coingeckoId: 'curve-dao-token' },
        { symbol: 'SUSHI', name: 'SushiSwap (Arbitrum)', coingeckoId: 'sushi' },
        { symbol: 'BAL', name: 'Balancer (Arbitrum)', coingeckoId: 'balancer' }
    ],
    base: [
        { symbol: 'ETH', name: 'Ethereum (Base)', coingeckoId: 'ethereum' },
        { symbol: 'USDT', name: 'Tether (Base)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (Base)', coingeckoId: 'usd-coin' },
        { symbol: 'DAI', name: 'Dai (Base)', coingeckoId: 'dai' },
        { symbol: 'AERO', name: 'Aerodrome Finance', coingeckoId: 'aerodrome-finance' },
        { symbol: 'DEGEN', name: 'Degen', coingeckoId: 'degen-base' },
        { symbol: 'BRETT', name: 'Brett', coingeckoId: 'brett-base' },
        { symbol: 'TYBG', name: 'TYBG', coingeckoId: 'tybg' },
        { symbol: 'MOG', name: 'Mog Coin', coingeckoId: 'mog-coin' },
        { symbol: 'TOSHI', name: 'Toshi', coingeckoId: 'toshi' },
        { symbol: 'BASED', name: 'Based', coingeckoId: 'based' },
        { symbol: 'ONCHAIN', name: 'Onchain', coingeckoId: 'onchain' },
        { symbol: 'OWS', name: 'OWS', coingeckoId: 'ows' },
        { symbol: 'BSX', name: 'BSX', coingeckoId: 'bsx' },
        { symbol: 'CBETH', name: 'Coinbase Wrapped Staked ETH', coingeckoId: 'coinbase-wrapped-staked-eth' },
        { symbol: 'USDS', name: 'Stablecoin', coingeckoId: 'staked-usds' },
        { symbol: 'WELL', name: 'WELL', coingeckoId: 'well' },
        { symbol: 'SNX', name: 'Synthetix (Base)', coingeckoId: 'synthetix-network-token' }
    ],
    bnb: [
        { symbol: 'BNB', name: 'BNB', coingeckoId: 'binancecoin' },
        { symbol: 'USDT', name: 'Tether (BSC)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (BSC)', coingeckoId: 'usd-coin' },
        { symbol: 'BTCB', name: 'Bitcoin BEP2', coingeckoId: 'bitcoin-bep2' },
        { symbol: 'ETH', name: 'Ethereum (BSC)', coingeckoId: 'ethereum' },
        { symbol: 'CAKE', name: 'PancakeSwap', coingeckoId: 'pancakeswap-token' },
        { symbol: 'XRP', name: 'XRP (BSC)', coingeckoId: 'ripple' },
        { symbol: 'ADA', name: 'Cardano (BSC)', coingeckoId: 'cardano' },
        { symbol: 'DOGE', name: 'Dogecoin (BSC)', coingeckoId: 'dogecoin' },
        { symbol: 'DOT', name: 'Polkadot (BSC)', coingeckoId: 'polkadot' },
        { symbol: 'UNI', name: 'Uniswap (BSC)', coingeckoId: 'uniswap' },
        { symbol: 'LINK', name: 'Chainlink (BSC)', coingeckoId: 'chainlink' },
        { symbol: 'BUSD', name: 'Binance USD', coingeckoId: 'binance-usd' },
        { symbol: 'SHIB', name: 'Shiba Inu (BSC)', coingeckoId: 'shiba-inu' },
        { symbol: 'MATIC', name: 'Polygon (BSC)', coingeckoId: 'matic-network' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin (BSC)', coingeckoId: 'wrapped-bitcoin' },
        { symbol: 'DAI', name: 'Dai (BSC)', coingeckoId: 'dai' },
        { symbol: 'AAVE', name: 'Aave (BSC)', coingeckoId: 'aave' },
        { symbol: 'SUSHI', name: 'SushiSwap (BSC)', coingeckoId: 'sushi' },
        { symbol: 'COMP', name: 'Compound (BSC)', coingeckoId: 'compound-governance-token' }
    ],
    avalanche: [
        { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2' },
        { symbol: 'USDT', name: 'Tether (Avalanche)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (Avalanche)', coingeckoId: 'usd-coin' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin (Avalanche)', coingeckoId: 'wrapped-bitcoin' },
        { symbol: 'WETH', name: 'Wrapped Ethereum (Avalanche)', coingeckoId: 'weth' },
        { symbol: 'LINK', name: 'Chainlink (Avalanche)', coingeckoId: 'chainlink' },
        { symbol: 'AAVE', name: 'Aave (Avalanche)', coingeckoId: 'aave' },
        { symbol: 'JOE', name: 'Trader Joe', coingeckoId: 'joe' },
        { symbol: 'QI', name: 'BENQI', coingeckoId: 'benqi' },
        { symbol: 'PNG', name: 'Pangolin', coingeckoId: 'pangolin' },
        { symbol: 'XAVA', name: 'Avalaunch', coingeckoId: 'avalaunch' },
        { symbol: 'SHIBX', name: 'SHIBAVAX', coingeckoId: 'shibavax' },
        { symbol: 'MIM', name: 'Magic Internet Money', coingeckoId: 'magic-internet-money' },
        { symbol: 'SPELL', name: 'Spell Token', coingeckoId: 'spell-token' },
        { symbol: 'TIME', name: 'Wonderland', coingeckoId: 'wonderland' },
        { symbol: 'BAT', name: 'Basic Attention Token (Avalanche)', coingeckoId: 'basic-attention-token' },
        { symbol: 'DAI', name: 'Dai (Avalanche)', coingeckoId: 'dai' },
        { symbol: 'UNI', name: 'Uniswap (Avalanche)', coingeckoId: 'uniswap' },
        { symbol: 'SNX', name: 'Synthetix (Avalanche)', coingeckoId: 'synthetix-network-token' },
        { symbol: 'CRV', name: 'Curve DAO (Avalanche)', coingeckoId: 'curve-dao-token' }
    ],
    polygon: [
        { symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
        { symbol: 'USDT', name: 'Tether (Polygon)', coingeckoId: 'tether' },
        { symbol: 'USDC', name: 'USD Coin (Polygon)', coingeckoId: 'usd-coin' },
        { symbol: 'WBTC', name: 'Wrapped Bitcoin (Polygon)', coingeckoId: 'wrapped-bitcoin' },
        { symbol: 'WETH', name: 'Wrapped Ethereum (Polygon)', coingeckoId: 'weth' },
        { symbol: 'AAVE', name: 'Aave (Polygon)', coingeckoId: 'aave' },
        { symbol: 'QUICK', name: 'QuickSwap', coingeckoId: 'quickswap' },
        { symbol: 'SUSHI', name: 'SushiSwap (Polygon)', coingeckoId: 'sushi' },
        { symbol: 'CRV', name: 'Curve DAO (Polygon)', coingeckoId: 'curve-dao-token' },
        { symbol: 'LINK', name: 'Chainlink (Polygon)', coingeckoId: 'chainlink' },
        { symbol: 'UNI', name: 'Uniswap (Polygon)', coingeckoId: 'uniswap' },
        { symbol: 'BAL', name: 'Balancer (Polygon)', coingeckoId: 'balancer' },
        { symbol: 'GHST', name: 'Aavegotchi', coingeckoId: 'aavegotchi' },
        { symbol: 'DAI', name: 'Dai (Polygon)', coingeckoId: 'dai' },
        { symbol: 'SNX', name: 'Synthetix (Polygon)', coingeckoId: 'synthetix-network-token' },
        { symbol: 'MUST', name: 'Must', coingeckoId: 'must' },
        { symbol: 'DFYN', name: 'Dfyn Network', coingeckoId: 'dfyn-network' },
        { symbol: 'DINO', name: 'DinoSwap', coingeckoId: 'dinoswap' },
        { symbol: 'IRIS', name: 'Iris', coingeckoId: 'iris-network' },
        { symbol: 'COMBO', name: 'COMBO', coingeckoId: 'combo' }
    ]
};

// ==============================
// CALCULATION FUNCTIONS
// ==============================

function updateCalculation() {
    const fromAmountInput = document.getElementById('fromAmount');
    if (!fromAmountInput) return;
    
    const fromAmount = parseFloat(fromAmountInput.value) || 0;
    const fromPrice = currentFromToken.price || 0;
    const toPrice = currentToToken.price || 0;
    
    // Calculate USD value
    const usdValue = fromAmount * fromPrice;
    
    // Calculate to amount
    let toAmount = 0;
    if (toPrice > 0) {
        toAmount = usdValue / toPrice;
    }
    
    // Update DOM elements
    const toAmountInput = document.getElementById('toAmount');
    if (toAmountInput) {
        toAmountInput.value = toAmount.toFixed(toAmount < 0.01 ? 8 : 4);
    }
    
    const fromPriceDisplay = document.getElementById('fromPriceDisplay');
    if (fromPriceDisplay) {
        fromPriceDisplay.textContent = `$${usdValue.toFixed(2)}`;
    }
    
    const toPriceDisplay = document.getElementById('toPriceDisplay');
    if (toPriceDisplay) {
        toPriceDisplay.textContent = `$${(toAmount * toPrice).toFixed(2)}`;
    }
    
    // Update conversion rate
    if (fromPrice > 0 && toPrice > 0) {
        const rate = fromPrice / toPrice;
        const rateElement = document.getElementById('conversion-rate');
        if (rateElement) {
            rateElement.textContent = `1 ${currentFromToken.symbol} = ${rate.toFixed(4)} ${currentToToken.symbol}`;
        }
    }
}

// ==============================
// TOKEN MANAGEMENT
// ==============================

function getChainLogo(chain) {
    const logos = {
        'ethereum': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        'solana': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        'monad': 'images/monad_logo.png',
        'arbitrum': 'https://assets.coingecko.com/coins/images/16547/large/Arbitrum.png',
        'base': 'https://assets.coingecko.com/coins/images/27645/large/base.png',
        'bnb': 'https://assets.coingecko.com/coins/images/12591/large/binance-coin-logo.png',
        'avalanche': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
        'polygon': 'https://assets.coingecko.com/coins/images/4713/large/polygon.png'
    };
    return logos[chain] || 'https://assets.coingecko.com/coins/images/279/large/ethereum.png';
}

async function loadTokensForChain(chain) {
    const tokenList = document.getElementById('tokenList');
    if (!tokenList) return;
    
    tokenList.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Loading tokens...</div>';
    
    const chainTokens = CHAIN_TOKENS[chain] || CHAIN_TOKENS.ethereum;
    const tokensWithData = [];
    
    // Sort tokens - current chain's native token first
    const sortedTokens = chainTokens.sort((a, b) => {
        if (a.symbol === chain.toUpperCase()) return -1;
        if (b.symbol === chain.toUpperCase()) return 1;
        return 0;
    });
    
    for (let i = 0; i < Math.min(sortedTokens.length, 10); i++) {
        const token = sortedTokens[i];
        
        try {
            const tokenConfig = TOKEN_CONFIG[token.symbol] || {
                name: token.name,
                symbol: token.symbol,
                chain: chain,
                coingeckoId: token.coingeckoId,
                icon: `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
                fallbackPrice: 1.00
            };
            
            // Get price
            const price = await priceService.getPrice(token.symbol);
            
            tokensWithData.push({
                symbol: token.symbol,
                name: token.name,
                chain: chain,
                price: price,
                change24h: 0, // Simulated for now
                logo: tokenConfig.icon,
                chainLogo: getChainLogo(chain),
                address: tokenConfig.address || '',
                id: token.coingeckoId
            });
        } catch (error) {
            console.error(`Error loading token ${token.symbol}:`, error);
        }
    }
    
    selectedTokenList = tokensWithData;
    renderTokenList(tokensWithData);
}

function renderTokenList(tokens) {
    const tokenList = document.getElementById('tokenList');
    if (!tokenList) return;
    
    tokenList.innerHTML = '';
    
    if (tokens.length === 0) {
        tokenList.innerHTML = '<div class="loading">No tokens found</div>';
        return;
    }
    
    tokens.forEach(token => {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        tokenItem.dataset.symbol = token.symbol;
        tokenItem.dataset.chain = token.chain;
        tokenItem.dataset.id = token.id;
        
        const changeClass = token.change24h >= 0 ? 'positive' : 'negative';
        const changeSymbol = token.change24h >= 0 ? '+' : '';
        
        tokenItem.innerHTML = `
            <div class="token-icon-container">
                <img src="${token.logo}" alt="${token.symbol}" 
                     onerror="this.onerror=null; this.src='https://assets.coingecko.com/coins/images/1/large/bitcoin.png'">
                <div class="token-chain-badge">
                    <img src="${token.chainLogo}" alt="${token.chain}">
                </div>
            </div>
            <div class="token-info">
                <h4>${token.symbol}</h4>
                <p>${token.name}</p>
            </div>
            <div class="token-price">
                <div>$${token.price > 0 ? token.price.toFixed(token.price < 0.01 ? 6 : 4) : 'N/A'}</div>
                ${token.price > 0 ? 
                    `<div class="token-change ${changeClass}">${changeSymbol}${token.change24h.toFixed(2)}%</div>` : 
                    ''
                }
            </div>
        `;
        
        tokenItem.addEventListener('click', () => selectToken(token));
        tokenList.appendChild(tokenItem);
    });
}

async function selectToken(token) {
    if (!currentBtn) return;
    
    // Update button text
    const span = currentBtn.querySelector('span');
    if (span) span.textContent = token.symbol;
    
    // Update icon
    if (currentIcon) {
        currentIcon.innerHTML = `
            <img src="${token.logo}" alt="${token.symbol}"
                 onerror="this.onerror=null; this.src='https://assets.coingecko.com/coins/images/1/large/bitcoin.png'">
            <div class="chain-badge">
                <img src="${token.chainLogo}" alt="${token.chain}">
            </div>
        `;
    }
    
    // Update current token
    const tokenConfig = TOKEN_CONFIG[token.symbol] || {
        name: token.name,
        symbol: token.symbol,
        chain: token.chain,
        icon: token.logo,
        fallbackPrice: token.price
    };
    
    if (currentBtn.classList.contains('from-btn')) {
        currentFromToken = {
            symbol: token.symbol,
            price: token.price || 0,
            logo: token.logo,
            chain: token.chain,
            chainLogo: token.chainLogo,
            address: token.address,
            config: tokenConfig
        };
    } else {
        currentToToken = {
            symbol: token.symbol,
            price: token.price || 0,
            logo: token.logo,
            chain: token.chain,
            chainLogo: token.chainLogo,
            address: token.address,
            config: tokenConfig
        };
    }
    
    // Get fresh price
    const freshPrice = await priceService.getPrice(token.symbol);
    if (currentBtn.classList.contains('from-btn')) {
        currentFromToken.price = freshPrice;
    } else {
        currentToToken.price = freshPrice;
    }
    
    updateCalculation();
    closeTokenModal();
}

// ==============================
// TOKEN SEARCH - LOCAL FRIENDLY
// ==============================

async function searchToken() {
    const searchInput = document.getElementById('tokenSearch');
    const query = searchInput.value.trim();
    
    if (!query) {
        loadTokensForChain(currentChain);
        return;
    }
    
    const tokenList = document.getElementById('tokenList');
    if (!tokenList) return;
    
    tokenList.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Searching...</div>';
    
    try {
        // Try multiple search methods
        const tokens = await searchAllMethods(query);
        
        if (tokens.length > 0) {
            // Sort: exact symbol match first, then by name match
            const sortedTokens = tokens.sort((a, b) => {
                const aExactSymbol = a.symbol.toUpperCase() === query.toUpperCase();
                const bExactSymbol = b.symbol.toUpperCase() === query.toUpperCase();
                if (aExactSymbol && !bExactSymbol) return -1;
                if (!aExactSymbol && bExactSymbol) return 1;
                
                const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
                const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                
                return 0;
            });
            
            renderTokenList(sortedTokens);
        } else {
            // Try to find in our predefined tokens
            const foundTokens = [];
            for (const chain in CHAIN_TOKENS) {
                for (const token of CHAIN_TOKENS[chain]) {
                    if (token.symbol.toUpperCase().includes(query.toUpperCase()) || 
                        token.name.toLowerCase().includes(query.toLowerCase())) {
                        foundTokens.push({
                            symbol: token.symbol,
                            name: token.name,
                            chain: chain,
                            price: TOKEN_CONFIG[token.symbol]?.fallbackPrice || 0,
                            change24h: 0,
                            logo: TOKEN_CONFIG[token.symbol]?.icon || `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
                            chainLogo: getChainLogo(chain),
                            address: TOKEN_CONFIG[token.symbol]?.address || ''
                        });
                    }
                }
            }
            
            if (foundTokens.length > 0) {
                renderTokenList(foundTokens.slice(0, 10));
            } else {
                tokenList.innerHTML = '<div class="loading">No tokens found. Try a different search.</div>';
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        tokenList.innerHTML = '<div class="loading">Search failed. Check your connection.</div>';
    }
}

async function searchAllMethods(query) {
    const tokens = [];
    
    // Method 1: Check if it's a known token in our config
    if (TOKEN_CONFIG[query.toUpperCase()]) {
        const token = TOKEN_CONFIG[query.toUpperCase()];
        tokens.push({
            symbol: query.toUpperCase(),
            name: token.name,
            chain: token.chain,
            price: token.fallbackPrice,
            change24h: 0,
            logo: token.icon,
            chainLogo: getChainLogo(token.chain),
            address: token.address || ''
        });
    }
    
    // Method 2: Try to find in chain tokens
    for (const chain in CHAIN_TOKENS) {
        const found = CHAIN_TOKENS[chain].find(t => 
            t.symbol.toUpperCase() === query.toUpperCase() || 
            t.name.toLowerCase().includes(query.toLowerCase())
        );
        
        if (found) {
            const tokenConfig = TOKEN_CONFIG[found.symbol] || {
                name: found.name,
                icon: `https://assets.coingecko.com/coins/images/1/large/bitcoin.png`,
                fallbackPrice: 0
            };
            
            const price = await priceService.getPrice(found.symbol);
            
            tokens.push({
                symbol: found.symbol,
                name: found.name,
                chain: chain,
                price: price,
                change24h: 0,
                logo: tokenConfig.icon,
                chainLogo: getChainLogo(chain),
                address: tokenConfig.address || ''
            });
        }
    }
    
    // Method 3: Try CoinGecko search via proxy (only if we have internet)
    if (navigator.onLine) {
        try {
            const proxyUrl = 'https://corsproxy.io/?';
            const searchUrl = `${proxyUrl}https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
            
            const response = await fetch(searchUrl);
            if (response.ok) {
                const data = await response.json();
                
                if (data.coins && data.coins.length > 0) {
                    for (let i = 0; i < Math.min(data.coins.length, 5); i++) {
                        const coin = data.coins[i];
                        
                        // Get price for this coin
                        const priceUrl = `${proxyUrl}https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`;
                        const priceResponse = await fetch(priceUrl);
                        const priceData = await priceResponse.json();
                        
                        tokens.push({
                            symbol: coin.symbol.toUpperCase(),
                            name: coin.name,
                            chain: 'ethereum', // Default
                            price: priceData[coin.id]?.usd || 0,
                            change24h: 0,
                            logo: coin.large || coin.thumb,
                            chainLogo: getChainLogo('ethereum'),
                            address: '',
                            id: coin.id
                        });
                    }
                }
            }
        } catch (error) {
            console.log('CoinGecko search failed:', error);
        }
    }
    
    return tokens;
}

// ==============================
// MODAL FUNCTIONS
// ==============================

function openTokenModal(btnType) {
    const modal = document.getElementById('tokenModal');
    if (!modal) return;
    
    currentBtn = document.querySelector(`.${btnType}-btn`);
    currentIcon = document.querySelector(`.${btnType}-icon`);
    
    modal.style.display = 'flex';
    loadTokensForChain(currentChain);
}

function closeTokenModal() {
    const modal = document.getElementById('tokenModal');
    if (modal) {
        modal.style.display = 'none';
        const searchInput = document.getElementById('tokenSearch');
        if (searchInput) searchInput.value = '';
    }
}

function closeAddNetworkModal() {
    const modal = document.getElementById('addNetworkModal');
    if (modal) modal.style.display = 'none';
}

// ==============================
// SWAP FUNCTION
// ==============================

function swapTokens() {
    // Swap token data
    const tempToken = {...currentFromToken};
    currentFromToken = {...currentToToken};
    currentToToken = tempToken;
    
    // Update button text
    const fromSpan = document.querySelector('.from-btn span');
    const toSpan = document.querySelector('.to-btn span');
    if (fromSpan && toSpan) {
        const tempText = fromSpan.textContent;
        fromSpan.textContent = toSpan.textContent;
        toSpan.textContent = tempText;
    }
    
    // Update icons
    const fromIcon = document.querySelector('.from-icon');
    const toIcon = document.querySelector('.to-icon');
    if (fromIcon && toIcon) {
        const tempHTML = fromIcon.innerHTML;
        fromIcon.innerHTML = toIcon.innerHTML;
        toIcon.innerHTML = tempHTML;
    }
    
    // Update calculation
    updateCalculation();
}

// ==============================
// INITIALIZATION
// ==============================

async function initializePrices() {
    console.log('Initializing prices...');
    
    // Get initial prices
    currentFromToken.price = await priceService.getPrice('SOL');
    currentToToken.price = await priceService.getPrice('MON');
    
    // Initial calculation with 2 SOL as example
    const fromAmountInput = document.getElementById('fromAmount');
    if (fromAmountInput) {
        fromAmountInput.value = '2';
        updateCalculation();
    }
    
    // Update status
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
        if (navigator.onLine) {
            statusElement.textContent = '🟢 Using live prices';
        } else {
            statusElement.textContent = '🟡 Using cached prices (offline)';
        }
    }
    
    // Update prices every 30 seconds
    setInterval(async () => {
        if (navigator.onLine) {
            await priceService.updateAllPrices();
        }
    }, 30000);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Token buttons
    const fromBtn = document.querySelector('.from-btn');
    const toBtn = document.querySelector('.to-btn');
    
    if (fromBtn) {
        fromBtn.addEventListener('click', () => openTokenModal('from'));
    }
    
    if (toBtn) {
        toBtn.addEventListener('click', () => openTokenModal('to'));
    }
    
    // Amount input
    const fromAmountInput = document.getElementById('fromAmount');
    if (fromAmountInput) {
        fromAmountInput.addEventListener('input', updateCalculation);
    }
    
    // Swap button
    const swapBtn = document.getElementById('swapButton');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapTokens);
    }
    
    // Connect button
    const connectBtn = document.getElementById('connectButton');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            alert('Wallet connection would be implemented here. In a real app, this would connect to Phantom, MetaMask, etc.');
        });
    }
    
    // Modal close buttons
    const modalBackdrop = document.getElementById('modalBackdrop');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeTokenModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeTokenModal);
    }
    
    // Chain selection
    const chainButtons = document.querySelectorAll('.chain-btn');
    chainButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            chainButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChain = btn.dataset.chain;
            loadTokensForChain(currentChain);
        });
    });
    
    // Search functionality
    const searchBtn = document.getElementById('searchTokenBtn');
    const searchInput = document.getElementById('tokenSearch');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchToken);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchToken();
            }
        });
    }
    
    // Add network modal
    const addNetworkBtn = document.getElementById('addNetworkBtn');
    if (addNetworkBtn) {
        addNetworkBtn.addEventListener('click', () => {
            const modal = document.getElementById('addNetworkModal');
            if (modal) modal.style.display = 'flex';
        });
    }
    
    const closeAddNetworkBtn = document.getElementById('closeAddNetworkBtn');
    const addNetworkBackdrop = document.getElementById('addNetworkBackdrop');
    
    if (closeAddNetworkBtn) {
        closeAddNetworkBtn.addEventListener('click', closeAddNetworkModal);
    }
    
    if (addNetworkBackdrop) {
        addNetworkBackdrop.addEventListener('click', closeAddNetworkModal);
    }
    
    // Save network button
    const saveNetworkBtn = document.getElementById('saveNetworkBtn');
    if (saveNetworkBtn) {
        saveNetworkBtn.addEventListener('click', () => {
            alert('Network added! (This is a demo)');
            closeAddNetworkModal();
        });
    }
    
    // Footer links
    const footerLinks = ['termsLink', 'privacyLink', 'faqLink', 'twitterLink', 'discordLink'];
    footerLinks.forEach(id => {
        const link = document.getElementById(id);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (id === 'twitterLink') {
                    window.open('https://twitter.com', '_blank');
                } else if (id === 'discordLink') {
                    window.open('https://discord.com', '_blank');
                } else {
                    alert(`${id.replace('Link', '')} - Add your actual URL here`);
                }
            });
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTokenModal();
            closeAddNetworkModal();
        }
    });
}

// ==============================
// MAIN INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Monad Bridge...');
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initialize prices
    initializePrices();
    
    // Load initial tokens
    loadTokensForChain(currentChain);
    
    console.log('Monad Bridge initialized successfully!');
});

// ==============================
// HELPER FUNCTIONS
// ==============================

// Update Base logo in HTML (fix the broken URL)
function fixBaseLogo() {
    const baseLogo = 'https://assets.coingecko.com/coins/images/27645/large/base.png';
    
    // Update Base logo in chain buttons
    document.querySelectorAll('.chain-btn[data-chain="base"] img').forEach(img => {
        img.src = baseLogo;
    });
    
    // Update Base logo in chain logo function
    window.getChainLogo = function(chain) {
        const logos = {
            'ethereum': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            'solana': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
            'monad': 'images/monad_logo.png',
            'arbitrum': 'https://assets.coingecko.com/coins/images/16547/large/Arbitrum.png',
            'base': baseLogo,
            'bnb': 'https://assets.coingecko.com/coins/images/12591/large/binance-coin-logo.png',
            'avalanche': 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
            'polygon': 'https://assets.coingecko.com/coins/images/4713/large/polygon.png'
        };
        return logos[chain] || 'https://assets.coingecko.com/coins/images/279/large/ethereum.png';
    };
}

// Run after DOM is loaded
setTimeout(fixBaseLogo, 100);
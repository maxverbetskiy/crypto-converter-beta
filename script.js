// Main application logic for CryptoBot Converter
class CryptoConverter {
    constructor() {
        this.isProcessing = false;
        this.currentResults = [];
        this.currentLanguage = 'en';
        this.currentTheme = 'dark';
        
        // Wait for dependencies to load
        this.initializeWhenReady();
    }
    
    // Initialize when all dependencies are loaded
    async initializeWhenReady() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const checkDependencies = () => {
            return window.CONFIG && 
                   window.USER_SETTINGS && 
                   window.Settings && 
                   window.Utils && 
                   window.storage && 
                   window.transactionParser && 
                   window.cryptoAPI &&
                   window.TRANSLATIONS;
        };
        
        const waitForDependencies = () => {
            if (checkDependencies()) {
                this.init();
            } else if (attempts < maxAttempts) {
                attempts++;
                console.log(`⏳ Waiting for dependencies... (${attempts}/${maxAttempts})`);
                setTimeout(waitForDependencies, 100);
            } else {
                console.error('❌ Failed to load dependencies');
                this.showToast(Utils.t('error') + ': Failed to load application', 'error');
            }
        };
        
        waitForDependencies();
    }
    
    // Initialize the application
    async init() {
        try {
            console.log('🚀 Initializing CryptoBot Converter...');
            
            // Load user settings
            if (window.Settings) {
                window.Settings.load();
            }
            
            // Set initial language and theme
            this.currentLanguage = USER_SETTINGS.language || 'en';
            this.currentTheme = USER_SETTINGS.theme || 'dark';
            
            // Apply settings
            this.applyTheme(this.currentTheme);
            this.applyLanguage(this.currentLanguage);
            
            // Initialize UI components
            this.initializeUI();
            this.bindEvents();
            
            // Show ready message
            this.showToast(Utils.t('success') + '!', 'success');
            
            console.log('✅ CryptoBot Converter initialized successfully');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showToast(Utils.t('error') + ': ' + error.message, 'error');
        }
    }
    
    // Initialize UI components
    initializeUI() {
        // Update current language display
        this.updateLanguageDisplay();
        
        // Initialize tooltips, animations, etc.
        if (USER_SETTINGS.enableAnimations) {
            this.enableAnimations();
        }
    }
    
    // Bind event listeners
    bindEvents() {
        // Form submission
        const form = document.getElementById('converterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processTransactions();
            });
        }
        
        // Load example button
        const loadExampleBtn = document.getElementById('loadExample');
        if (loadExampleBtn) {
            loadExampleBtn.addEventListener('click', () => {
                this.loadExampleTransactions();
            });
        }
        
        // Theme switcher
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Language switcher
        this.bindLanguageEvents();
        
        // Result actions
        this.bindResultEvents();
        
        // Keyboard shortcuts
        this.bindKeyboardEvents();
        
        // Settings change listener
        window.addEventListener('settingsChanged', (e) => {
            this.onSettingsChanged(e.detail);
        });
    }
    
    // Bind language switcher events
    bindLanguageEvents() {
        const langBtn = document.getElementById('langBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (langBtn && langDropdown) {
            // Toggle dropdown
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = langDropdown.style.display === 'block';
                langDropdown.style.display = isVisible ? 'none' : 'block';
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                langDropdown.style.display = 'none';
            });
        }
    }
    
    // Bind result action events
    bindResultEvents() {
        // Copy results
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyResults();
            });
        }
        
        // Clear results
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearResults();
            });
        }
    }
    
    // Bind keyboard shortcuts
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter: Process transactions
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.processTransactions();
            }
            
            // Ctrl+D: Load example
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.loadExampleTransactions();
            }
            
            // Ctrl+T: Toggle theme
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            // Escape: Clear results
            if (e.key === 'Escape') {
                this.clearResults();
            }
        });
    }
    
    // Main function to process transactions
    async processTransactions() {
        if (this.isProcessing) {
            this.showToast(Utils.t('processing_in_progress'), 'warning');
            return;
        }
        
        const input = document.getElementById('transactionsInput').value.trim();
        if (!input) {
            this.showToast(Utils.t('no_transactions'), 'warning');
            document.getElementById('transactionsInput').focus();
            return;
        }
        
        // Check API availability
        if (!window.cryptoAPI) {
            this.showToast(Utils.t('api_error'), 'error');
            return;
        }
        
        this.isProcessing = true;
        this.showLoading(true);
        
        try {
            // Parse transactions
            console.log('📝 Parsing transactions...');
            const parseResult = window.transactionParser.parseTransactions(input);
            
            if (parseResult.errors.length > 0) {
                this.showParsingErrors(parseResult.errors);
            }
            
            if (parseResult.transactions.length === 0) {
                this.showToast(Utils.t('invalid_format'), 'error');
                return;
            }
            
            console.log(`📊 Found ${parseResult.transactions.length} valid transactions`);
            
            // Show progress
            this.showProgress(true);
            
            // Convert transactions to USD
            const results = await this.convertTransactions(parseResult.transactions);
            
            // Display results
            this.displayResults(results);
            
            // Update statistics
            const totalUsd = results.reduce((sum, r) => sum + (r.usd_value || 0), 0);
            const successCount = results.filter(r => r.success).length;
            
            if (window.storage) {
                window.storage.updateStats({
                    successfulConversions: successCount,
                    failedConversions: results.length - successCount
                });
            }
            
            // Success message
            const message = `${Utils.t('completed')}: ${successCount}/${results.length} - ${Utils.formatCurrency(totalUsd)}`;
            this.showToast(message, 'success');
            
        } catch (error) {
            console.error('❌ Processing error:', error);
            this.showToast(Utils.t('error') + ': ' + error.message, 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
            this.showProgress(false);
        }
    }
    
    // Convert transactions using CryptoCompare API
    async convertTransactions(transactions) {
        const results = [];
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressPercent = document.getElementById('progressPercent');
        
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            
            // Update progress
            const progress = ((i + 1) / transactions.length) * 100;
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${Utils.t('processing')} ${transaction.currency}...`;
            if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
            
            console.log(`🔄 Converting: ${transaction.amount} ${transaction.currency} on ${transaction.date}`);
            
            try {
                const priceData = await window.cryptoAPI.getHistoricalPrice(transaction.currency, transaction.date);
                
                if (priceData) {
                    const usdValue = transaction.amount * priceData.price;
                    results.push({
                        transaction,
                        priceData,
                        usd_value: usdValue,
                        success: true
                    });
                    
                    console.log(`✅ Converted: ${transaction.currency} @ $${priceData.price.toFixed(8)} = $${usdValue.toFixed(2)}`);
                } else {
                    results.push({
                        transaction,
                        error: Utils.t('unsupported_crypto') + ': ' + transaction.currency,
                        success: false
                    });
                    
                    console.log(`❌ Failed: ${transaction.currency}`);
                }
            } catch (error) {
                results.push({
                    transaction,
                    error: Utils.t('api_error') + ': ' + error.message,
                    success: false
                });
                
                console.error(`❌ Exception for ${transaction.currency}:`, error);
            }
        }
        
        return results;
    }
    
    // Display conversion results
    displayResults(results) {
        const container = document.getElementById('resultsContainer');
        const totalValueEl = document.getElementById('totalValue');
        const resultsSection = document.getElementById('resultsSection');
        const successCountEl = document.getElementById('successCount');
        const errorCountEl = document.getElementById('errorCount');
        
        if (!container) return;
        
        // Show results section
        if (resultsSection) {
            resultsSection.style.display = 'block';
            
            // Smooth scroll to results
            setTimeout(() => {
                resultsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 300);
        }
        
        // Clear previous results
        container.innerHTML = '';
        
        let totalUsd = 0;
        let successCount = 0;
        let errorCount = 0;
        
        // Create result items
        results.forEach((result, index) => {
            const resultElement = this.createResultElement(result, index);
            container.appendChild(resultElement);
            
            if (result.success) {
                totalUsd += result.usd_value;
                successCount++;
            } else {
                errorCount++;
            }
        });
        
        // Update summary with animations
        if (totalValueEl) {
            this.animateNumber(totalValueEl, 0, totalUsd, 1000, (value) => 
                Utils.formatCurrency(value, USER_SETTINGS.decimalPlaces)
            );
        }
        
        if (successCountEl) {
            this.animateNumber(successCountEl, 0, successCount, 800);
        }
        
        if (errorCountEl) {
            this.animateNumber(errorCountEl, 0, errorCount, 800);
        }
        
        // Save results for copying/exporting
        this.currentResults = results;
        
        console.log(`📈 Results displayed: ${successCount} success, ${errorCount} errors, total: $${totalUsd.toFixed(2)}`);
    }
    
    // Create individual result element
    createResultElement(result, index) {
        const div = document.createElement('div');
        div.className = `result-item ${result.success ? 'success' : 'error'}`;
        
        if (result.success) {
            const date = Utils.formatDate(result.transaction.date);
            const rate = result.priceData.price;
            const value = result.usd_value;
            
            div.innerHTML = `
                <div class="result-header">
                    <div class="result-info">
                        <span class="result-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${date}
                        </span>
                        <span class="result-source">
                            <i class="fas fa-database"></i>
                            ${Utils.t('source_' + result.priceData.source)}
                        </span>
                    </div>
                    <span class="result-status success">
                        <i class="fas fa-check-circle"></i>
                    </span>
                </div>
                <div class="result-content">
                    <div class="result-amount">
                        <i class="fas fa-coins"></i>
                        ${Utils.formatNumber(result.transaction.amount)} ${result.transaction.currency}
                    </div>
                    <div class="result-conversion">
                        <div class="conversion-rate">
                            ${Utils.t('rate_label')} ${Utils.formatCurrency(rate, 8)}
                        </div>
                        <div class="conversion-value">
                            ${Utils.formatCurrency(value, USER_SETTINGS.decimalPlaces)}
                        </div>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="result-header">
                    <div class="result-info">
                        <span class="result-error-line">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${Utils.t('error_line_label')} ${result.transaction.lineNumber || 'N/A'}
                        </span>
                    </div>
                    <span class="result-status error">
                        <i class="fas fa-times-circle"></i>
                    </span>
                </div>
                <div class="result-content">
                    <div class="result-amount">
                        <i class="fas fa-coins"></i>
                        ${result.transaction.amount} ${result.transaction.currency}
                    </div>
                    <div class="result-error-message">
                        <i class="fas fa-info-circle"></i>
                        ${result.error}
                    </div>
                </div>
            `;
        }
        
        // Add entrance animation
        if (USER_SETTINGS.enableAnimations) {
            setTimeout(() => {
                div.classList.add('animate-in');
            }, index * 100);
        } else {
            div.classList.add('animate-in');
        }
        
        return div;
    }
    
    // Animate number changes
    animateNumber(element, start, end, duration, formatter = null) {
        if (!USER_SETTINGS.enableAnimations || !element) {
            element.textContent = formatter ? formatter(end) : end;
            return;
        }
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            element.textContent = formatter ? formatter(current) : Math.round(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // UI Control Methods
    
    showLoading(show) {
        const loadingSection = document.getElementById('loadingSection');
        if (loadingSection) {
            loadingSection.style.display = show ? 'block' : 'none';
        }
        
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.disabled = show;
            if (show) {
                convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + Utils.t('processing');
            } else {
                convertBtn.innerHTML = `<i class="fas fa-rocket"></i> <span data-translate="convert_button">${Utils.t('convert_button')}</span> <div class="btn-ripple"></div>`;
            }
        }
    }
    
    showProgress(show) {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = show ? 'block' : 'none';
        }
        
        if (!show) {
            // Reset progress
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const progressPercent = document.getElementById('progressPercent');
            
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = Utils.t('progress_text');
            if (progressPercent) progressPercent.textContent = '0%';
        }
    }
    
    showParsingErrors(errors) {
        const errorMessages = errors.slice(0, 3).map(err => 
            `${Utils.t('error_line_label')} ${err.lineNumber}: ${err.error}`
        ).join('\n');
        
        let message = `${Utils.t('invalid_format')}:\n${errorMessages}`;
        if (errors.length > 3) {
            message += `\n...and ${errors.length - 3} more errors`;
        }
        
        this.showToast(message, 'warning');
    }
    
    // Theme and Language Methods
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        Settings.set('theme', newTheme);
    }
    
    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.currentTheme = theme;
        
        // Update theme button icon
        const darkIcon = document.querySelector('.theme-icon-dark');
        const lightIcon = document.querySelector('.theme-icon-light');
        
        if (darkIcon && lightIcon) {
            if (theme === 'dark') {
                darkIcon.style.display = 'inline';
                lightIcon.style.display = 'none';
            } else {
                darkIcon.style.display = 'none';
                lightIcon.style.display = 'inline';
            }
        }
        
        console.log(`🎨 Theme applied: ${theme}`);
    }
    
    applyLanguage(language) {
        this.currentLanguage = language;
        
        // Update all translatable elements
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = Utils.t(key, language);
            
            if (element.hasAttribute('data-translate-placeholder')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Update document language
        document.documentElement.lang = language;
        
        // Update language display
        this.updateLanguageDisplay();
        
        console.log(`🌐 Language applied: ${language}`);
    }
    
    updateLanguageDisplay() {
        const currentLangEl = document.getElementById('currentLang');
        if (currentLangEl) {
            currentLangEl.textContent = this.currentLanguage.toUpperCase();
        }
    }
    
    // Action Methods
    
    loadExampleTransactions() {
        const textarea = document.getElementById('transactionsInput');
        if (textarea && window.transactionParser) {
            textarea.value = window.transactionParser.getExampleTransactions();
            this.showToast(Utils.t('success'), 'info');
            
            // Focus on convert button
            setTimeout(() => {
                const convertBtn = document.getElementById('convertBtn');
                if (convertBtn) convertBtn.focus();
            }, 100);
        }
    }
    
    async copyResults() {
        if (!this.currentResults || this.currentResults.length === 0) {
            this.showToast(Utils.t('no_results'), 'warning');
            return;
        }
        
        try {
            const resultText = this.formatResultsForCopy();
            const success = await Utils.copyToClipboard(resultText);
            
            if (success) {
                this.showToast(Utils.t('copy_success'), 'success');
            } else {
                this.showToast(Utils.t('copy_error'), 'error');
            }
        } catch (error) {
            console.error('❌ Copy error:', error);
            this.showToast(Utils.t('copy_error'), 'error');
        }
    }
    
    formatResultsForCopy() {
        const lines = ['CryptoBot Converter Results', '=' + '='.repeat(30), ''];
        
        let totalUsd = 0;
        let successCount = 0;
        
        this.currentResults.forEach((result, index) => {
            if (result.success) {
                const date = Utils.formatDate(result.transaction.date);
                const amount = Utils.formatNumber(result.transaction.amount);
                const rate = Utils.formatCurrency(result.priceData.price, 8);
                const value = Utils.formatCurrency(result.usd_value, USER_SETTINGS.decimalPlaces);
                
                lines.push(`${index + 1}. ${date}`);
                lines.push(`   ${amount} ${result.transaction.currency} × ${rate} = ${value}`);
                lines.push(`   Source: ${result.priceData.source}`);
                lines.push('');
                
                totalUsd += result.usd_value;
                successCount++;
            } else {
                lines.push(`${index + 1}. ERROR: ${result.transaction.currency}`);
                lines.push(`   ${result.error}`);
                lines.push('');
            }
        });
        
        lines.push('-'.repeat(40));
        lines.push(`Total: ${Utils.formatCurrency(totalUsd, USER_SETTINGS.decimalPlaces)}`);
        lines.push(`Successful: ${successCount}/${this.currentResults.length}`);
        lines.push(`Generated: ${Utils.formatDateTime(new Date())}`);
        
        return lines.join('\n');
    }
    
    clearResults() {
        const resultsSection = document.getElementById('resultsSection');
        const container = document.getElementById('resultsContainer');
        
        if (resultsSection) resultsSection.style.display = 'none';
        if (container) container.innerHTML = '';
        
        this.currentResults = [];
        this.showToast(Utils.t('results_cleared'), 'info');
    }
    
    // Utility Methods
    
    enableAnimations() {
        document.documentElement.style.setProperty('--animation-duration', '0.3s');
        document.body.classList.add('animations-enabled');
    }
    
    showToast(message, type = 'info') {
        if (!USER_SETTINGS.enableNotifications) return;
        
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type] || icons.info}"></i>
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, CONFIG.TOAST_DURATION);
    }
    
    onSettingsChanged(newSettings) {
        // React to settings changes
        if (newSettings.theme !== this.currentTheme) {
            this.applyTheme(newSettings.theme);
        }
        
        if (newSettings.language !== this.currentLanguage) {
            this.applyLanguage(newSettings.language);
        }
        
        if (newSettings.enableAnimations !== USER_SETTINGS.enableAnimations) {
            if (newSettings.enableAnimations) {
                this.enableAnimations();
            }
        }
        
        // Refresh results if decimal places changed
        if (this.currentResults.length > 0 && newSettings.decimalPlaces !== USER_SETTINGS.decimalPlaces) {
            this.displayResults(this.currentResults);
        }
    }
}

// Global functions for HTML interactions
window.switchLanguage = function(language) {
    if (window.cryptoConverter) {
        window.cryptoConverter.applyLanguage(language);
        Settings.set('language', language);
    }
    
    // Close dropdown
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.style.display = 'none';
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM loaded, creating CryptoBot Converter...');
    window.cryptoConverter = new CryptoConverter();
});

// Add CSS animations
const animationStyles = `
@keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-20px); opacity: 0; }
}

.result-item {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
}

.result-item.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.toast {
    animation: slideIn 0.3s ease forwards;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

console.log('✅ CryptoBot Converter script loaded');

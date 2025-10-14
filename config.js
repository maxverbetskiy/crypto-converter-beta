// Configuration for CryptoBot Converter (CryptoCompare Edition)
const CONFIG = {
    // CryptoCompare API Settings
    CRYPTOCOMPARE_BASE_URL: 'https://min-api.cryptocompare.com/data/v2',
    RATE_LIMIT_DELAY: 300, // 300ms between requests
    MAX_CONCURRENT_REQUESTS: 5,
    
    // Application Info
    APP_NAME: 'CryptoBot Converter',
    APP_VERSION: '2.0.0',
    APP_SUBTITLE: 'CryptoCompare Edition',
    
    // UI Settings
    TOAST_DURATION: 4000, // 4 seconds
    ANIMATION_DURATION: 300, // 300ms
    
    // Date Formats (American Priority)
    DATE_FORMATS: [
        'M/D/YYYY H:mm:ss',    // 9/8/2025 0:57:11
        'M/D/YYYY H:mm',       // 9/8/2025 0:57
        'MM/DD/YYYY HH:mm:ss', // 09/08/2025 00:57:11
        'MM/DD/YYYY HH:mm'     // 09/08/2025 00:57
    ],
    
    // Debug Mode
    DEBUG_MODE: false
};

// User Settings (persisted in localStorage)
let USER_SETTINGS = {
    // Display
    theme: 'dark',        // 'dark' or 'light'
    language: 'en',       // 'en' or 'ru'
    decimalPlaces: 2,     // for USD display
    
    // Features
    enableAnimations: true,
    enableNotifications: true,
    
    // Advanced
    showDetailedResults: true
};

// Complete translations for both languages
const TRANSLATIONS = {
    en: {
        // Header & Navigation
        subtitle: 'Converter',
        
        // Hero Section
        hero_title: 'Cryptocurrency',
        hero_subtitle: 'Transaction Converter',
        hero_description: 'Convert your cryptocurrency transactions to USD using real-time CryptoCompare API data',
        hero_badge: 'Powered by CryptoCompare',
        
        // Converter Form
        converter_title: 'Transaction Converter',
        converter_subtitle: 'Enter your cryptocurrency transactions below',
        transactions_label: 'Transaction Data',
        textarea_placeholder: '9/8/2025 0:57:11\t3,989.50\tBTC\n9/10/2025 17:44:11\t2.062399\tETH\n9/15/2025 20:15:11\t15,000\tUSDC',
        format_help: 'Format: MM/DD/YYYY HH:mm:ss [TAB] amount [TAB] symbol',
        load_example: 'Load Example',
        convert_button: 'Convert to USD',
        
        // Loading & Progress
        loading_text: 'Converting transactions...',
        progress_text: 'Processing',
        
        // Results
        results_title: 'Conversion Results',
        total_value: 'Total Value',
        successful: 'Successful',
        failed: 'Failed',
        copy_results: 'Copy Results',
        clear_results: 'Clear Results',
        
        // Info Cards
        date_formats_title: 'Supported Date Formats',
        american_format: 'American format with seconds',
        zero_padded: 'Zero-padded format',
        without_seconds: 'Without seconds',
        
        number_formats_title: 'Number Formats',
        comma_thousands: 'Comma for thousands, dot for decimals',
        decimal_only: 'Decimal numbers',
        large_numbers: 'Large numbers with commas',
        
        crypto_support_title: 'Supported Cryptocurrencies',
        crypto_note: '+ 2000+ other cryptocurrencies via CryptoCompare',
        
        // Messages & Notifications
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        loading: 'Loading...',
        processing: 'Processing...',
        completed: 'Completed',
        
        // Validation Messages
        no_transactions: 'Please enter transactions to convert',
        invalid_format: 'Invalid transaction format',
        processing_in_progress: 'Conversion already in progress',
        no_results: 'No results to display',
        copy_success: 'Results copied to clipboard',
        copy_error: 'Failed to copy results',
        results_cleared: 'Results cleared',
        
        // API Messages
        api_error: 'API request failed',
        rate_limit: 'Rate limit exceeded, please wait',
        network_error: 'Network connection error',
        unsupported_crypto: 'Cryptocurrency not supported',
        historical_data_unavailable: 'Historical data not available for this date',
        
        // Result Item Labels
        rate_label: 'Rate:',
        value_label: 'Value:',
        date_label: 'Date:',
        amount_label: 'Amount:',
        error_line_label: 'Error in line',
        source_cryptocompare: 'CryptoCompare',
        source_stablecoin: 'Stablecoin (~$1.00)',
        
        // Theme
        theme_dark: 'Dark Theme',
        theme_light: 'Light Theme',
        
        // Stablecoins
        stablecoin_price: 'Stablecoin (≈ $1.00)'
    },
    
    ru: {
        // Header & Navigation
        subtitle: 'Конвертер',
        
        // Hero Section
        hero_title: 'Криптовалютный',
        hero_subtitle: 'Конвертер Транзакций',
        hero_description: 'Конвертируйте ваши криптовалютные транзакции в доллары США, используя актуальные данные CryptoCompare API',
        hero_badge: 'На базе CryptoCompare',
        
        // Converter Form
        converter_title: 'Конвертер Транзакций',
        converter_subtitle: 'Введите ваши криптовалютные транзакции ниже',
        transactions_label: 'Данные Транзакций',
        textarea_placeholder: '9/8/2025 0:57:11\t3,989.50\tBTC\n9/10/2025 17:44:11\t2.062399\tETH\n9/15/2025 20:15:11\t15,000\tUSDC',
        format_help: 'Формат: ММ/ДД/ГГГГ ЧЧ:мм:сс [TAB] количество [TAB] символ',
        load_example: 'Загрузить Пример',
        convert_button: 'Конвертировать в USD',
        
        // Loading & Progress
        loading_text: 'Конвертируем транзакции...',
        progress_text: 'Обрабатываем',
        
        // Results
        results_title: 'Результаты Конвертации',
        total_value: 'Общая Стоимость',
        successful: 'Успешно',
        failed: 'Ошибок',
        copy_results: 'Копировать Результаты',
        clear_results: 'Очистить Результаты',
        
        // Info Cards
        date_formats_title: 'Поддерживаемые Форматы Дат',
        american_format: 'Американский формат с секундами',
        zero_padded: 'Формат с ведущими нулями',
        without_seconds: 'Без секунд',
        
        number_formats_title: 'Форматы Чисел',
        comma_thousands: 'Запятая для тысяч, точка для дробных',
        decimal_only: 'Дробные числа',
        large_numbers: 'Большие числа с запятыми',
        
        crypto_support_title: 'Поддерживаемые Криптовалюты',
        crypto_note: '+ 2000+ других криптовалют через CryptoCompare',
        
        // Messages & Notifications
        success: 'Успех',
        error: 'Ошибка',
        warning: 'Предупреждение',
        info: 'Информация',
        loading: 'Загрузка...',
        processing: 'Обработка...',
        completed: 'Завершено',
        
        // Validation Messages
        no_transactions: 'Пожалуйста, введите транзакции для конвертации',
        invalid_format: 'Неверный формат транзакции',
        processing_in_progress: 'Конвертация уже выполняется',
        no_results: 'Нет результатов для отображения',
        copy_success: 'Результаты скопированы в буфер обмена',
        copy_error: 'Не удалось скопировать результаты',
        results_cleared: 'Результаты очищены',
        
        // API Messages
        api_error: 'Ошибка запроса к API',
        rate_limit: 'Превышен лимит запросов, подождите',
        network_error: 'Ошибка сетевого соединения',
        unsupported_crypto: 'Криптовалюта не поддерживается',
        historical_data_unavailable: 'Исторические данные недоступны для этой даты',
        
        // Result Item Labels
        rate_label: 'Курс:',
        value_label: 'Стоимость:',
        date_label: 'Дата:',
        amount_label: 'Количество:',
        error_line_label: 'Ошибка в строке',
        source_cryptocompare: 'CryptoCompare',
        source_stablecoin: 'Стейблкоин (~$1.00)',
        
        // Theme
        theme_dark: 'Темная Тема',
        theme_light: 'Светлая Тема',
        
        // Stablecoins
        stablecoin_price: 'Стейблкоин (≈ $1.00)'
    }
};

// Settings Management
const Settings = {
    // Load settings from localStorage
    load() {
        try {
            const saved = localStorage.getItem('cryptobot_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                USER_SETTINGS = { ...USER_SETTINGS, ...parsed };
                
                if (CONFIG.DEBUG_MODE) {
                    console.log('⚙️ Settings loaded:', USER_SETTINGS);
                }
            }
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.reset();
        }
    },
    
    // Save settings to localStorage
    save(newSettings = {}) {
        try {
            USER_SETTINGS = { ...USER_SETTINGS, ...newSettings };
            localStorage.setItem('cryptobot_settings', JSON.stringify(USER_SETTINGS));
            
            if (CONFIG.DEBUG_MODE) {
                console.log('💾 Settings saved:', USER_SETTINGS);
            }
            
            // Dispatch settings change event
            window.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: USER_SETTINGS
            }));
            
            return true;
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            return false;
        }
    },
    
    // Reset to defaults
    reset() {
        USER_SETTINGS = {
            theme: 'dark',
            language: 'en',
            decimalPlaces: 2,
            enableAnimations: true,
            enableNotifications: true,
            showDetailedResults: true
        };
        
        try {
            localStorage.removeItem('cryptobot_settings');
            console.log('🔄 Settings reset to defaults');
        } catch (error) {
            console.error('❌ Error resetting settings:', error);
        }
    },
    
    // Get specific setting
    get(key, defaultValue = null) {
        return USER_SETTINGS.hasOwnProperty(key) ? USER_SETTINGS[key] : defaultValue;
    },
    
    // Set specific setting
    set(key, value) {
        USER_SETTINGS[key] = value;
        return this.save();
    }
};

// Utility Functions
const Utils = {
    // Format currency with proper American formatting
    formatCurrency(amount, decimals = 2) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(amount);
        } catch (error) {
            return `$${amount.toFixed(decimals)}`;
        }
    },
    
    // Format number with American comma separators
    formatNumber(number, decimals = 6) {
        try {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: decimals,
                useGrouping: true
            }).format(number);
        } catch (error) {
            return number.toFixed(decimals);
        }
    },
    
    // Format date in American style
    formatDate(date, locale = 'en-US') {
        try {
            return new Date(date).toLocaleDateString(locale, {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return date;
        }
    },
    
    // Format date and time
    formatDateTime(date, locale = 'en-US') {
        try {
            return new Date(date).toLocaleString(locale);
        } catch (error) {
            return date;
        }
    },
    
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            return false;
        }
    },
    
    // Get translation
    t(key, lang = null) {
        const language = lang || USER_SETTINGS.language || 'en';
        const translations = TRANSLATIONS[language] || TRANSLATIONS.en;
        return translations[key] || TRANSLATIONS.en[key] || key;
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Settings.load();
    
    if (CONFIG.DEBUG_MODE) {
        console.log('🚀 CryptoBot Converter (CryptoCompare Edition) initialized');
        console.log('📊 Configuration:', CONFIG);
        console.log('⚙️ Settings:', USER_SETTINGS);
    }
});

// Export for other modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.USER_SETTINGS = USER_SETTINGS;
    window.Settings = Settings;
    window.Utils = Utils;
    window.TRANSLATIONS = TRANSLATIONS;
}

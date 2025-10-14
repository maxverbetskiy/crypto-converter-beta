// Simple storage management for CryptoBot Converter
class CryptoStorage {
    constructor() {
        this.keys = {
            settings: 'cryptobot_settings',
            stats: 'cryptobot_stats',
            cache: 'cryptobot_cache'
        };
        
        this.init();
    }
    
    init() {
        try {
            // Check if localStorage is available
            if (!this.isAvailable()) {
                console.warn('⚠️ localStorage not available, using memory storage');
                this.useMemoryStorage();
                return;
            }
            
            // Initialize statistics
            this.initStats();
            
            console.log('💾 Storage system initialized');
        } catch (error) {
            console.error('❌ Storage initialization error:', error);
        }
    }
    
    // Check localStorage availability
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Fallback to memory storage
    useMemoryStorage() {
        this.memory = {};
        
        // Override methods
        this.getItem = (key) => this.memory[key] || null;
        this.setItem = (key, value) => { this.memory[key] = value; return true; };
        this.removeItem = (key) => { delete this.memory[key]; return true; };
    }
    
    // Basic storage operations
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`❌ Error reading ${key}:`, error);
            return null;
        }
    }
    
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`❌ Error writing ${key}:`, error);
            return false;
        }
    }
    
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Error deleting ${key}:`, error);
            return false;
        }
    }
    
    // Initialize statistics
    initStats() {
        const stats = this.getItem(this.keys.stats) || {
            firstUsed: new Date().toISOString(),
            totalConversions: 0,
            successfulConversions: 0,
            failedConversions: 0,
            apiRequests: 0,
            apiErrors: 0,
            lastUsed: null,
            favoriteLanguage: 'en',
            favoriteTheme: 'dark'
        };
        
        this.setItem(this.keys.stats, stats);
    }
    
    // Update statistics
    updateStats(metric, increment = 1) {
        try {
            const stats = this.getItem(this.keys.stats) || {};
            
            if (typeof metric === 'object') {
                // Update multiple metrics
                Object.assign(stats, metric);
            } else {
                // Update single metric
                stats[metric] = (stats[metric] || 0) + increment;
            }
            
            stats.lastUsed = new Date().toISOString();
            this.setItem(this.keys.stats, stats);
            
            if (CONFIG.DEBUG_MODE) {
                console.log(`📊 Stats updated: ${metric}`);
            }
        } catch (error) {
            console.error('❌ Error updating statistics:', error);
        }
    }
    
    // Get statistics
    getStats() {
        try {
            return this.getItem(this.keys.stats) || {};
        } catch (error) {
            console.error('❌ Error getting statistics:', error);
            return {};
        }
    }
    
    // Clear all stored data
    clearAll() {
        try {
            Object.values(this.keys).forEach(key => {
                this.removeItem(key);
            });
            
            console.log('🗑️ All storage data cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing storage:', error);
            return false;
        }
    }
    
    // Get storage size (approximate)
    getStorageSize() {
        try {
            let totalSize = 0;
            
            Object.values(this.keys).forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                }
            });
            
            return totalSize;
        } catch (error) {
            return 0;
        }
    }
    
    // Export all data
    exportData() {
        try {
            const data = {
                version: CONFIG.APP_VERSION,
                exported: new Date().toISOString(),
                settings: USER_SETTINGS,
                stats: this.getStats()
            };
            
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('❌ Export error:', error);
            return null;
        }
    }
    
    // Import data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate data structure
            if (!data.version || !data.settings) {
                throw new Error('Invalid data format');
            }
            
            // Import settings
            if (data.settings) {
                Settings.save(data.settings);
            }
            
            console.log('📥 Data imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Import error:', error);
            return false;
        }
    }
}

// Create global instance
const storage = new CryptoStorage();

// Export for other modules
if (typeof window !== 'undefined') {
    window.storage = storage;
}

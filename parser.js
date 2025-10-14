// Transaction parser for American date/number formats
class TransactionParser {
    constructor() {
        // Regex patterns for parsing transaction lines
        this.patterns = [
            // Primary: TAB separated
            /^([^\t]+)\t+([0-9.,\s]+)\t+([A-Za-z]{2,10})$/,
            // Secondary: Multiple spaces
            /^([^\s]+\s+[^\s]+(?:\s+[^\s]+)*)\s+([0-9.,\s]+)\s+([A-Za-z]{2,10})$/,
            // Fallback: Single space
            /^(.+?)\s+([0-9.,\s]+)\s+([A-Za-z]{2,10})$/
        ];
        
        // Parsing statistics
        this.stats = {
            totalLines: 0,
            parsedLines: 0,
            errorLines: 0,
            supportedFormats: 0
        };
        
        console.log('📝 American format transaction parser initialized');
    }
    
    // Parse transactions from text input
    parseTransactions(text) {
        try {
            this.resetStats();
            
            const lines = this.preprocessText(text);
            const transactions = [];
            const errors = [];
            
            this.stats.totalLines = lines.length;
            
            lines.forEach((line, index) => {
                const result = this.parseTransactionLine(line, index + 1);
                
                if (result.success) {
                    transactions.push({
                        ...result.transaction,
                        lineNumber: index + 1,
                        originalLine: line
                    });
                    this.stats.parsedLines++;
                } else {
                    errors.push({
                        lineNumber: index + 1,
                        line: line,
                        error: result.error,
                        suggestion: result.suggestion
                    });
                    this.stats.errorLines++;
                }
            });
            
            // Update storage statistics
            if (window.storage) {
                window.storage.updateStats({
                    totalConversions: transactions.length,
                    lastUsed: new Date().toISOString()
                });
            }
            
            console.log(`📊 Parsing complete: ${transactions.length} valid, ${errors.length} errors`);
            
            return { 
                transactions, 
                errors, 
                stats: this.stats 
            };
        } catch (error) {
            console.error('❌ Critical parsing error:', error);
            return { 
                transactions: [], 
                errors: [{ error: 'Critical parsing error', line: text }], 
                stats: this.stats 
            };
        }
    }
    
    // Preprocess input text
    preprocessText(text) {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .filter(line => !this.isCommentLine(line));
    }
    
    // Check if line is a comment
    isCommentLine(line) {
        return /^(#|\/\/|;|\*|\-\-)/.test(line.trim());
    }
    
    // Parse individual transaction line
    parseTransactionLine(line, lineNumber) {
        try {
            // Try each pattern
            for (const pattern of this.patterns) {
                const match = line.match(pattern);
                if (match) {
                    return this.processMatch(match, line, lineNumber);
                }
            }
            
            // If no pattern matches, try auto-detection
            return this.attemptAutoDetection(line, lineNumber);
            
        } catch (error) {
            return { 
                success: false, 
                error: `Processing error: ${error.message}`,
                suggestion: 'Check data format'
            };
        }
    }
    
    // Process regex match
    processMatch(match, line, lineNumber) {
        const [, dateTimeStr, amountStr, currencyStr] = match;
        
        // Parse American date format
        const parsedDate = this.parseAmericanDate(dateTimeStr.trim());
        if (!parsedDate) {
            return { 
                success: false, 
                error: `Invalid date format: "${dateTimeStr}"`,
                suggestion: 'Use American format: M/D/YYYY H:mm:ss (e.g., 9/8/2025 0:57:11)'
            };
        }
        
        // Parse American number format (comma thousands, dot decimal)
        const amount = this.parseAmericanNumber(amountStr.trim());
        if (amount === null || amount <= 0) {
            return { 
                success: false, 
                error: `Invalid amount: "${amountStr}"`,
                suggestion: 'Use American format: 15,000.50 (comma = thousands, dot = decimal)'
            };
        }
        
        // Parse and validate currency
        const currency = this.parseCurrency(currencyStr.trim());
        if (!currency) {
            return { 
                success: false, 
                error: `Invalid currency: "${currencyStr}"`,
                suggestion: 'Use standard symbols: BTC, ETH, USDC, etc.'
            };
        }
        
        // Additional validation
        const validation = this.validateTransaction(parsedDate, amount, currency);
        if (!validation.valid) {
            return { 
                success: false, 
                error: validation.error,
                suggestion: validation.suggestion
            };
        }
        
        return {
            success: true,
            transaction: {
                date: parsedDate,
                amount: amount,
                currency: currency,
                dateTime: dateTimeStr.trim(),
                parsedAt: new Date().toISOString()
            }
        };
    }
    
    // Attempt automatic detection of transaction parts
    attemptAutoDetection(line, lineNumber) {
        const parts = line.split(/[\s\t]+/).filter(p => p.length > 0);
        
        if (parts.length < 3) {
            return { 
                success: false, 
                error: 'Insufficient data in line',
                suggestion: 'Line should contain: date, time, amount, and currency'
            };
        }
        
        // Find currency (usually at the end, 2-10 letters)
        let currencyIndex = -1;
        for (let i = parts.length - 1; i >= 0; i--) {
            if (/^[A-Za-z]{2,10}$/.test(parts[i])) {
                currencyIndex = i;
                break;
            }
        }
        
        if (currencyIndex === -1) {
            return { 
                success: false, 
                error: 'Currency symbol not found',
                suggestion: 'Add currency symbol at the end (BTC, ETH, etc.)'
            };
        }
        
        // Find amount (before currency, contains numbers)
        let amountIndex = -1;
        for (let i = currencyIndex - 1; i >= 0; i--) {
            if (/^[0-9.,]+$/.test(parts[i])) {
                amountIndex = i;
                break;
            }
        }
        
        if (amountIndex === -1) {
            return { 
                success: false, 
                error: 'Amount not found',
                suggestion: 'Add numeric amount before currency'
            };
        }
        
        // Everything before amount is date/time
        const dateTimeParts = parts.slice(0, amountIndex);
        const dateTimeStr = dateTimeParts.join(' ');
        const amountStr = parts[amountIndex];
        const currencyStr = parts[currencyIndex];
        
        // Process as if it was a proper match
        const fakeMatch = ['', dateTimeStr, amountStr, currencyStr];
        return this.processMatch(fakeMatch, line, lineNumber);
    }
    
    // Parse American date format (M/D/YYYY priority)
    parseAmericanDate(dateTimeStr) {
        try {
            console.log(`🗓️ Parsing American date: "${dateTimeStr}"`);
            
            // American date formats (month/day/year)
            const americanFormats = [
                { 
                    regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
                    description: 'M/D/YYYY H:mm:ss'
                },
                { 
                    regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
                    description: 'M/D/YYYY H:mm'
                }
            ];

            for (const format of americanFormats) {
                const match = dateTimeStr.match(format.regex);
                if (match) {
                    console.log(`✅ Matched format: ${format.description}`);
                    
                    const [, monthStr, dayStr, yearStr, hourStr, minuteStr, secondStr] = match;
                    
                    // IMPORTANT: American format is M/D/Y (month first, then day)
                    const month = parseInt(monthStr);     // Month (M)
                    const day = parseInt(dayStr);         // Day (D) 
                    const year = parseInt(yearStr);       // Year (YYYY)
                    const hours = parseInt(hourStr) || 0;
                    const minutes = parseInt(minuteStr) || 0;
                    const seconds = parseInt(secondStr) || 0;
                    
                    console.log(`📅 Parsed: month=${month}, day=${day}, year=${year}`);
                    
                    // Create and validate date
                    const date = new Date(year, month - 1, day, hours, minutes, seconds);
                    
                    if (this.isValidDate(date, year, month, day)) {
                        const result = date.toISOString().split('T')[0];
                        console.log(`✅ Final date: ${result}`);
                        
                        this.stats.supportedFormats++;
                        return result;
                    } else {
                        console.log(`❌ Invalid date components: ${year}-${month}-${day}`);
                    }
                }
            }
            
            console.log(`❌ No American date format recognized: "${dateTimeStr}"`);
            return null;
            
        } catch (error) {
            console.error(`❌ Date parsing error: ${error.message}`);
            return null;
        }
    }
    
    // Validate parsed date
    isValidDate(date, year, month, day) {
        return date.getFullYear() === year && 
               date.getMonth() === month - 1 && 
               date.getDate() === day &&
               !isNaN(date.getTime());
    }
    
    // Parse American number format (1,234,567.89)
    parseAmericanNumber(amountStr) {
        try {
            console.log(`💰 Parsing American number: "${amountStr}"`);
            
            // Remove spaces and currency symbols
            let cleanStr = amountStr.replace(/\s+/g, '').replace(/[$€£¥₽]/g, '');
            console.log(`💰 Cleaned: "${cleanStr}"`);
            
            // American format: comma = thousands separator, dot = decimal separator
            
            // 1. Simple whole number (123, 1234)
            if (/^\d+$/.test(cleanStr)) {
                const result = parseInt(cleanStr);
                console.log(`✅ Whole number: "${cleanStr}" = ${result}`);
                return result;
            }
            
            // 2. Decimal only (123.45)
            if (/^\d+\.\d+$/.test(cleanStr) && !cleanStr.includes(',')) {
                const result = parseFloat(cleanStr);
                console.log(`✅ Decimal: "${cleanStr}" = ${result}`);
                return result;
            }
            
            // 3. Thousands with commas only (1,234 or 1,234,567)
            if (/^[\d,]+$/.test(cleanStr) && !cleanStr.includes('.')) {
                if (this.isValidCommaFormat(cleanStr)) {
                    const withoutCommas = cleanStr.replace(/,/g, '');
                    const result = parseInt(withoutCommas);
                    console.log(`✅ Thousands: "${cleanStr}" -> "${withoutCommas}" = ${result}`);
                    return result;
                }
            }
            
            // 4. Full American format with commas and decimal (1,234,567.89)
            if (/^[\d,]+\.\d+$/.test(cleanStr)) {
                const [integerPart, decimalPart] = cleanStr.split('.');
                
                if (this.isValidCommaFormat(integerPart) && /^\d+$/.test(decimalPart)) {
                    const cleanInteger = integerPart.replace(/,/g, '');
                    const result = parseFloat(`${cleanInteger}.${decimalPart}`);
                    console.log(`✅ Full American: "${cleanStr}" -> "${cleanInteger}.${decimalPart}" = ${result}`);
                    return result;
                }
            }
            
            console.log(`❌ Unrecognized American number format: "${cleanStr}"`);
            return null;
            
        } catch (error) {
            console.error(`❌ Number parsing error: ${error.message}`);
            return null;
        }
    }
    
    // Validate comma placement in American format
    isValidCommaFormat(str) {
        const parts = str.split(',');
        
        // First part can be 1-3 digits
        if (parts[0].length < 1 || parts[0].length > 3) {
            return false;
        }
        
        // All other parts must be exactly 3 digits
        for (let i = 1; i < parts.length; i++) {
            if (parts[i].length !== 3 || !/^\d{3}$/.test(parts[i])) {
                return false;
            }
        }
        
        return true;
    }
    
    // Parse currency symbol
    parseCurrency(currencyStr) {
        try {
            const currency = currencyStr.toUpperCase().trim();
            
            // Check format (2-10 uppercase letters)
            if (currency.length >= 2 && currency.length <= 10 && /^[A-Z]+$/.test(currency)) {
                return currency;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
    
    // Validate complete transaction
    validateTransaction(date, amount, currency) {
        const transactionDate = new Date(date);
        const now = new Date();
        const minDate = new Date('2009-01-01'); // Bitcoin genesis
        
        // Date validations
        if (transactionDate > now) {
            return { 
                valid: false, 
                error: 'Transaction date cannot be in the future',
                suggestion: 'Check the date format and value'
            };
        }
        
        if (transactionDate < minDate) {
            return { 
                valid: false, 
                error: 'Transaction date too old (before 2009)',
                suggestion: 'Cryptocurrencies started from 2009'
            };
        }
        
        // Amount validations
        if (amount <= 0) {
            return { 
                valid: false, 
                error: 'Amount must be greater than zero',
                suggestion: 'Enter a positive numeric value'
            };
        }
        
        if (amount > 1000000000) { // 1 billion limit
            return { 
                valid: false, 
                error: 'Amount too large (over 1 billion)',
                suggestion: 'Check if the amount is correct'
            };
        }
        
        // Currency validations
        if (!currency || currency.length < 2) {
            return { 
                valid: false, 
                error: 'Invalid currency symbol',
                suggestion: 'Use standard symbols like BTC, ETH, USDC'
            };
        }
        
        // Check for suspiciously small amounts
        const smallAmountLimits = {
            'BTC': 0.00000001,  // 1 satoshi
            'ETH': 0.000000001, // 1 gwei
            'LTC': 0.00000001,  // 1 litoshi
        };
        
        if (smallAmountLimits[currency] && amount < smallAmountLimits[currency]) {
            return { 
                valid: false, 
                error: `Amount too small for ${currency}`,
                suggestion: `Minimum ${currency} amount is ${smallAmountLimits[currency]}`
            };
        }
        
        return { valid: true };
    }
    
    // Reset statistics
    resetStats() {
        this.stats = {
            totalLines: 0,
            parsedLines: 0,
            errorLines: 0,
            supportedFormats: 0
        };
    }
    
    // Get example transactions in proper format
    getExampleTransactions() {
        return `9/8/2025 0:57:11\t3,989.50\tBTC
9/10/2025 17:44:11\t2.062399\tETH  
9/15/2025 20:15:11\t15,000\tUSDC
9/19/2025 17:56:11\t20,500.75\tUSDT
3/10/2022 16:45:00\t1,234.567\tADA`;
    }
    
    // Get supported date formats
    getSupportedDateFormats() {
        return [
            { format: '9/8/2025 0:57:11', description: 'American format with seconds' },
            { format: '9/8/2025 0:57', description: 'American format without seconds' },
            { format: '09/08/2025 00:57:11', description: 'Zero-padded American format' },
            { format: '12/31/2025 23:59:59', description: 'End of year example' }
        ];
    }
    
    // Get supported number formats
    getSupportedNumberFormats() {
        return [
            { format: '3,989', description: 'Thousands with comma → 3989' },
            { format: '15,000.50', description: 'American format → 15000.50' },
            { format: '2.062399', description: 'Decimal number → 2.062399' },
            { format: '1,234,567.89', description: 'Large number → 1234567.89' }
        ];
    }
    
    // Validate transaction batch (check for duplicates, etc.)
    validateBatch(transactions) {
        const issues = [];
        
        // Check for potential duplicates
        const seen = new Set();
        transactions.forEach((tx, index) => {
            const key = `${tx.date}_${tx.amount}_${tx.currency}`;
            if (seen.has(key)) {
                issues.push({
                    type: 'duplicate',
                    lineNumber: index + 1,
                    message: 'Possible duplicate transaction'
                });
            }
            seen.add(key);
        });
        
        // Check for suspicious patterns
        if (transactions.length > 1) {
            const amounts = transactions.map(tx => tx.amount);
            const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            
            transactions.forEach((tx, index) => {
                if (tx.amount > avgAmount * 50) {
                    issues.push({
                        type: 'suspicious',
                        lineNumber: index + 1,
                        message: 'Unusually large amount compared to others'
                    });
                }
            });
        }
        
        return issues;
    }
}

// Create global instance
window.transactionParser = new TransactionParser();

// Export for other modules
if (typeof window !== 'undefined') {
    window.TransactionParser = TransactionParser;
}

console.log('✅ American format transaction parser loaded');

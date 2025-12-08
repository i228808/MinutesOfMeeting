const crypto = require('crypto');

/**
 * Generate a random string
 */
const generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
    return `session_${Date.now()}_${generateRandomString(16)}`;
};

/**
 * Parse date string or relative date
 * @param {string} dateString - Date string like "2024-01-15" or "next Monday"
 * @returns {Date|null}
 */
const parseDate = (dateString) => {
    if (!dateString) return null;

    // Try to parse as ISO date first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Handle relative dates
    const today = new Date();
    const lowered = dateString.toLowerCase();

    if (lowered === 'today') {
        return today;
    }

    if (lowered === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }

    if (lowered.includes('next week')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek;
    }

    if (lowered.includes('next month')) {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
    }

    // Handle "next [day]" patterns
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
        if (lowered.includes(days[i])) {
            const targetDay = i;
            const currentDay = today.getDay();
            let daysUntil = targetDay - currentDay;
            if (daysUntil <= 0) daysUntil += 7;

            const result = new Date(today);
            result.setDate(result.getDate() + daysUntil);
            return result;
        }
    }

    return null;
};

/**
 * Format date for display
 */
const formatDate = (date, format = 'short') => {
    if (!date) return 'N/A';

    const d = new Date(date);

    switch (format) {
        case 'short':
            return d.toLocaleDateString();
        case 'long':
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        case 'iso':
            return d.toISOString();
        case 'time':
            return d.toLocaleTimeString();
        default:
            return d.toLocaleDateString();
    }
};

/**
 * Calculate duration in minutes between two dates
 */
const getDurationMinutes = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    return Math.round(diffMs / 60000);
};

/**
 * Sanitize filename for safe storage
 */
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-z0-9._-]/gi, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    return {
        skip,
        limit: limitNum,
        page: pageNum
    };
};

/**
 * Create pagination response
 */
const paginateResponse = (data, total, page, limit) => {
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    };
};

/**
 * Extract file extension
 */
const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

module.exports = {
    generateRandomString,
    generateSessionId,
    parseDate,
    formatDate,
    getDurationMinutes,
    sanitizeFilename,
    paginate,
    paginateResponse,
    getFileExtension,
    isValidEmail
};

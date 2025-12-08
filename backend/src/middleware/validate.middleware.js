const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors from express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
};

/**
 * Custom validation helpers
 */
const validators = {
    // Check if string is valid MongoDB ObjectId
    isObjectId: (value) => {
        return /^[0-9a-fA-F]{24}$/.test(value);
    },

    // Check if date is in the future
    isFutureDate: (value) => {
        const date = new Date(value);
        return date > new Date();
    },

    // Check if value is in enum
    isInEnum: (value, enumValues) => {
        return enumValues.includes(value);
    }
};

module.exports = {
    validate,
    validators
};

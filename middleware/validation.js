const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User registration validation
const validateUserRegistration = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian phone number is required'),
  
  body('role')
    .isIn(['vendor', 'supplier'])
    .withMessage('Role must be either vendor or supplier'),
  
  // Conditional validations for suppliers
  body('businessName')
    .if(body('role').equals('supplier'))
    .notEmpty()
    .withMessage('Business name is required for suppliers'),
  
  body('fssaiNumber')
    .if(body('role').equals('supplier'))
    .matches(/^\d{14}$/)
    .withMessage('FSSAI number must be exactly 14 digits'),
  
  // Conditional validations for vendors
  body('vendorType')
    .if(body('role').equals('vendor'))
    .isIn(['street_food', 'restaurant', 'cafe', 'catering'])
    .withMessage('Valid vendor type is required'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Product validation
const validateProduct = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('category')
    .isIn([
      'vegetables', 'fruits', 'grains_cereals', 'dairy', 'meat_poultry',
      'seafood', 'spices_herbs', 'packaged_goods', 'oils_fats', 'beverages',
      'snacks', 'other'
    ])
    .withMessage('Valid category is required'),
  
  body('price.amount')
    .isFloat({ min: 0 })
    .withMessage('Price amount must be a positive number'),
  
  body('price.unit')
    .isIn(['kg', 'grams', 'liters', 'pieces', 'packets', 'boxes'])
    .withMessage('Valid price unit is required'),
  
  body('minimumOrderQuantity')
    .isInt({ min: 1 })
    .withMessage('Minimum order quantity must be at least 1'),
  
  body('availableQuantity')
    .isInt({ min: 0 })
    .withMessage('Available quantity must be a non-negative integer'),
  
  body('qualityGrade')
    .optional()
    .isIn(['A', 'B', 'C'])
    .withMessage('Quality grade must be A, B, or C'),
  
  handleValidationErrors
];

// Cart item validation
const validateCartItem = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes must not exceed 200 characters'),
  
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('deliveryAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('deliveryAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  
  body('deliveryAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  
  body('deliveryAddress.pincode')
    .matches(/^\d{6}$/)
    .withMessage('Valid 6-digit pincode is required'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash_on_delivery', 'online', 'bank_transfer'])
    .withMessage('Valid payment method is required'),
  
  body('vendorNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Vendor notes must not exceed 500 characters'),
  
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  
  body('qualityRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),
  
  body('deliveryRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Delivery rating must be between 1 and 5'),
  
  body('communicationRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  
  body('valueForMoneyRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value for money rating must be between 1 and 5'),
  
  handleValidationErrors
];

// Query parameter validations
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateProductQuery = [
  query('category')
    .optional()
    .isIn([
      'vegetables', 'fruits', 'grains_cereals', 'dairy', 'meat_poultry',
      'seafood', 'spices_herbs', 'packaged_goods', 'oils_fats', 'beverages',
      'snacks', 'other'
    ])
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('search')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (field) => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateCartItem,
  validateOrder,
  validateReview,
  validatePagination,
  validateProductQuery,
  validateObjectId,
  handleValidationErrors
};
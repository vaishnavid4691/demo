# BazaarSetu API Documentation

## Overview
BazaarSetu is a backend API that connects street food vendors with verified suppliers for raw food materials. The API provides role-based access control, real-time order management, and comprehensive review systems.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Role-Based Access
- **Vendor**: Street food vendors who can browse products, manage cart, place orders, and write reviews
- **Supplier**: Raw material suppliers who can manage products, handle orders, and respond to reviews

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new vendor or supplier account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+919876543210",
  "role": "vendor", // or "supplier"
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "coordinates": {
      "latitude": 19.0760,
      "longitude": 72.8777
    }
  },
  // For suppliers only:
  "businessName": "Fresh Foods Supply",
  "fssaiNumber": "12345678901234",
  // For vendors only:
  "vendorType": "street_food"
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Get Profile
**GET** `/auth/profile`
*Requires authentication*

### Update Profile
**PUT** `/auth/profile`
*Requires authentication*

### Change Password
**POST** `/auth/change-password`
*Requires authentication*

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

---

## Product Endpoints

### Get All Products
**GET** `/products`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by category
- `search` (optional): Search in name, description, tags
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `verified` (optional): Show only verified suppliers (true/false)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc/desc (default: desc)

### Get Product by ID
**GET** `/products/:id`

### Get Product Categories
**GET** `/products/categories`

### Create Product
**POST** `/products`
*Requires authentication (Supplier only)*

**Request Body:**
```json
{
  "name": "Fresh Tomatoes",
  "description": "Premium quality fresh tomatoes",
  "category": "vegetables",
  "price": {
    "amount": 50,
    "unit": "kg"
  },
  "minimumOrderQuantity": 5,
  "availableQuantity": 100,
  "qualityGrade": "A",
  "tags": ["fresh", "organic", "local"],
  "images": [
    {
      "url": "https://example.com/tomato.jpg",
      "altText": "Fresh red tomatoes"
    }
  ],
  "originLocation": {
    "state": "Maharashtra",
    "district": "Pune"
  }
}
```

### Update Product
**PUT** `/products/:id`
*Requires authentication (Supplier only - own products)*

### Delete Product
**DELETE** `/products/:id`
*Requires authentication (Supplier only - own products)*

### Get Supplier's Products
**GET** `/products/supplier/my-products`
*Requires authentication (Supplier only)*

### Update Product Stock
**PATCH** `/products/:id/stock`
*Requires authentication (Supplier only)*

**Request Body:**
```json
{
  "availableQuantity": 75
}
```

---

## Cart Endpoints

### Get Cart
**GET** `/cart`
*Requires authentication (Vendor only)*

### Add Item to Cart
**POST** `/cart/add`
*Requires authentication (Vendor only)*

**Request Body:**
```json
{
  "productId": "60d5ec49c2e4b7001f8e4e4e",
  "quantity": 10,
  "notes": "Please ensure freshness"
}
```

### Update Cart Item
**PUT** `/cart/update/:productId`
*Requires authentication (Vendor only)*

**Request Body:**
```json
{
  "quantity": 15
}
```

### Remove Item from Cart
**DELETE** `/cart/remove/:productId`
*Requires authentication (Vendor only)*

### Clear Cart
**DELETE** `/cart/clear`
*Requires authentication (Vendor only)*

### Get Cart Summary
**GET** `/cart/summary`
*Requires authentication (Vendor only)*

### Validate Cart
**POST** `/cart/validate`
*Requires authentication (Vendor only)*

---

## Order Endpoints

### Create Order
**POST** `/orders`
*Requires authentication (Vendor only)*

**Request Body:**
```json
{
  "deliveryAddress": {
    "street": "456 Food Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400002"
  },
  "paymentMethod": "cash_on_delivery",
  "vendorNotes": "Please deliver before 10 AM"
}
```

### Get Orders
**GET** `/orders`
*Requires authentication*

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by order status

### Get Order by ID
**GET** `/orders/:id`
*Requires authentication*

### Update Order Status
**PATCH** `/orders/:id/status`
*Requires authentication (Supplier only)*

**Request Body:**
```json
{
  "status": "accepted", // or "rejected", "processing", "shipped", "delivered"
  "notes": "Order accepted and will be processed today"
}
```

### Accept Order
**POST** `/orders/:id/accept`
*Requires authentication (Supplier only)*

### Reject Order
**POST** `/orders/:id/reject`
*Requires authentication (Supplier only)*

**Request Body:**
```json
{
  "reason": "Insufficient stock"
}
```

### Cancel Order
**PATCH** `/orders/:id/cancel`
*Requires authentication (Vendor only)*

### Get Order Analytics
**GET** `/orders/analytics/dashboard`
*Requires authentication*

---

## Review Endpoints

### Create Review
**POST** `/reviews`
*Requires authentication (Vendor only)*

**Request Body:**
```json
{
  "supplierId": "60d5ec49c2e4b7001f8e4e4e",
  "orderId": "60d5ec49c2e4b7001f8e4e4f",
  "productId": "60d5ec49c2e4b7001f8e4e50",
  "rating": 5,
  "comment": "Excellent quality products and timely delivery",
  "qualityRating": 5,
  "deliveryRating": 4,
  "communicationRating": 5,
  "valueForMoneyRating": 4
}
```

### Get Supplier Reviews
**GET** `/reviews/supplier/:supplierId`

### Get Vendor's Reviews
**GET** `/reviews/vendor/my-reviews`
*Requires authentication (Vendor only)*

### Update Review
**PUT** `/reviews/:id`
*Requires authentication (Vendor only)*

### Delete Review
**DELETE** `/reviews/:id`
*Requires authentication (Vendor only)*

### Add Supplier Response
**POST** `/reviews/:id/response`
*Requires authentication (Supplier only)*

**Request Body:**
```json
{
  "comment": "Thank you for your feedback. We appreciate your business!"
}
```

### Mark Review as Helpful
**POST** `/reviews/:id/helpful`
*Requires authentication*

### Report Review
**POST** `/reviews/:id/report`
*Requires authentication*

### Get Pending Reviews
**GET** `/reviews/pending`
*Requires authentication (Vendor only)*

### Get Review Analytics
**GET** `/reviews/analytics/summary`
*Requires authentication*

---

## Supplier Endpoints

### Get All Suppliers
**GET** `/suppliers`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `verified` (optional): Filter by verification status
- `search` (optional): Search in name/business name
- `city` (optional): Filter by city
- `state` (optional): Filter by state
- `sortBy` (optional): Sort field
- `sortOrder` (optional): Sort order

### Get Supplier Profile
**GET** `/suppliers/:id`

### Verify Supplier
**PATCH** `/suppliers/:id/verify`
*Requires authentication*

### Search Nearby Suppliers
**GET** `/suppliers/search/nearby`

**Query Parameters:**
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate
- `radius` (optional): Search radius in km (default: 50)

### Get Supplier Analytics
**GET** `/suppliers/analytics/dashboard`
*Requires authentication (Supplier only)*

### Get Popular Categories
**GET** `/suppliers/categories/popular`

### Get Profile Completion
**GET** `/suppliers/profile/completion`
*Requires authentication (Supplier only)*

---

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Product Categories

- `vegetables`
- `fruits`
- `grains_cereals`
- `dairy`
- `meat_poultry`
- `seafood`
- `spices_herbs`
- `packaged_goods`
- `oils_fats`
- `beverages`
- `snacks`
- `other`

---

## Order Status Flow

1. `pending` - Order placed by vendor
2. `accepted` - Supplier accepts the order
3. `rejected` - Supplier rejects the order
4. `processing` - Order is being prepared
5. `shipped` - Order has been shipped
6. `delivered` - Order delivered successfully
7. `cancelled` - Order cancelled by vendor

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bazaarsetu
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

---

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Create a `.env` file with the required variables.

3. **Start MongoDB:**
   Ensure MongoDB is running on your system.

4. **Start the Server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Test the API:**
   The server will start on `http://localhost:5000`

---

## Features Implemented

✅ **User Authentication**
- JWT-based authentication
- Role-based access control (Vendor/Supplier)
- Secure password hashing with bcrypt

✅ **Verified Suppliers**
- FSSAI number validation (14 digits)
- Supplier verification system
- Only verified suppliers can receive orders

✅ **Raw Material Management**
- CRUD operations for products
- Category-based organization
- Stock management
- Search and filtering

✅ **Cart System**
- Add/remove items
- Quantity updates
- Cart validation
- Grouped by suppliers

✅ **Order System**
- Order placement from cart
- Status tracking
- Supplier order management
- Order analytics

✅ **Health & Safety**
- FSSAI number requirement for suppliers
- Format validation and verification

✅ **Product & Supplier Reviews**
- 5-star rating system
- Detailed ratings (quality, delivery, communication, value)
- Supplier responses
- Review moderation

This API provides a complete backend solution for the BazaarSetu platform with all the requested features implemented and ready for production use.
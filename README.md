# BazaarSetu Backend 🍕🥬

A complete backend API for connecting street food vendors with verified suppliers for raw food materials. Built with Node.js, Express, and MongoDB.

## 🌟 Features

### ✅ User Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Vendor/Supplier)
- **Secure password hashing** with bcrypt
- Profile management and password change functionality

### ✅ Verified Supplier System
- **FSSAI number validation** (14-digit format enforcement)
- **Supplier verification process** for safety compliance
- Only verified suppliers can receive orders
- Comprehensive supplier profiles and ratings

### ✅ Raw Material Management
- **Complete CRUD operations** for products
- **Category-based organization** (vegetables, fruits, dairy, etc.)
- **Advanced search and filtering** capabilities
- **Real-time stock management**
- **Quality grading system** (A, B, C grades)

### ✅ Smart Cart System
- **Add/remove items** with quantity management
- **Real-time cart validation** (stock, pricing, availability)
- **Grouped by suppliers** for efficient ordering
- **Price and availability tracking**

### ✅ Order Management System
- **Seamless order placement** from cart
- **Real-time status tracking** (pending → accepted → processing → shipped → delivered)
- **Supplier order dashboard** with accept/reject functionality
- **Order analytics and reporting**
- **Automatic stock deduction** upon order placement

### ✅ Health & Safety Compliance
- **FSSAI number requirement** for all suppliers
- **Format validation and verification**
- **Safety-first approach** with verified suppliers only

### ✅ Review & Rating System
- **5-star rating system** with detailed breakdown
- **Multi-dimensional ratings** (quality, delivery, communication, value)
- **Supplier response system** for customer feedback
- **Review moderation** and reporting features
- **Verified purchase reviews** only

### ✅ Advanced Features
- **Geospatial search** for nearby suppliers
- **Analytics dashboards** for both vendors and suppliers
- **Profile completion tracking**
- **Popular categories analysis**
- **Low stock alerts**

## 🏗️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **Validation**: express-validator
- **CORS**: cors middleware
- **Environment Management**: dotenv

## 📁 Project Structure

```
bazaarsetu-backend/
├── models/           # Database models
│   ├── User.js       # User model (vendors & suppliers)
│   ├── Product.js    # Product model for raw materials
│   ├── Cart.js       # Shopping cart model
│   ├── Order.js      # Order management model
│   └── Review.js     # Review and rating model
├── routes/           # API route handlers
│   ├── auth.js       # Authentication routes
│   ├── products.js   # Product management routes
│   ├── cart.js       # Cart management routes
│   ├── orders.js     # Order handling routes
│   ├── reviews.js    # Review system routes
│   └── suppliers.js  # Supplier management routes
├── middleware/       # Custom middleware
│   ├── auth.js       # JWT authentication & authorization
│   └── validation.js # Input validation middleware
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
├── .env             # Environment variables
└── README.md        # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bazaarsetu-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Environment Configuration**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bazaarsetu
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   NODE_ENV=development
   ```

5. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using MongoDB directly
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Test the API**
   - Server runs on: `http://localhost:5000`
   - API endpoints: `http://localhost:5000/api`
   - Health check: `http://localhost:5000`

## 📚 API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick API Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Products
- `GET /api/products` - Browse all products
- `POST /api/products` - Create product (suppliers)
- `GET /api/products/categories` - Get product categories

#### Cart & Orders
- `GET /api/cart` - Get vendor cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/orders` - Place order
- `GET /api/orders` - Get orders

#### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/supplier/:id` - Get supplier reviews

## 🔧 API Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints.

### Example: Register a new supplier
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fresh Foods Supply",
    "email": "supplier@freshfoods.com",
    "password": "SecurePass123",
    "phone": "+919876543210",
    "role": "supplier",
    "businessName": "Fresh Foods Private Limited",
    "fssaiNumber": "12345678901234",
    "address": {
      "street": "123 Market Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "supplier@freshfoods.com",
    "password": "SecurePass123"
  }'
```

## 🏪 User Roles & Permissions

### Vendor (Street Food Vendor)
- ✅ Browse and search products
- ✅ Manage shopping cart
- ✅ Place and track orders
- ✅ Write reviews and ratings
- ✅ View order history and analytics

### Supplier (Raw Material Supplier)
- ✅ Manage product catalog
- ✅ Handle incoming orders
- ✅ Update stock levels
- ✅ Respond to reviews
- ✅ View sales analytics
- ⚠️ **Must be verified to receive orders**

## 🗄️ Database Schema

### Key Collections
- **users** - Vendors and suppliers with role-based fields
- **products** - Raw materials with detailed specifications
- **carts** - Vendor shopping carts with items
- **orders** - Order management with status tracking
- **reviews** - Rating and review system

### Indexes
- User email (unique)
- Product search (text index)
- Location-based queries (2dsphere)
- Order status and timestamps

## 🔒 Security Features

- **JWT Authentication** with 7-day expiry
- **Password hashing** with bcrypt (12 rounds)
- **Input validation** with express-validator
- **Role-based authorization** middleware
- **CORS protection** enabled
- **Environment-based configuration**

## 📊 Business Logic

### Order Flow
1. Vendor adds items to cart
2. Cart validation (stock, minimum order, supplier verification)
3. Order placement with automatic stock deduction
4. Supplier receives order notification
5. Supplier accepts/rejects order
6. Status tracking through delivery
7. Review opportunity after delivery

### Verification Process
1. Supplier registers with FSSAI number
2. FSSAI format validation (14 digits)
3. Manual verification process
4. Only verified suppliers receive orders

### Review System
1. Only delivered orders can be reviewed
2. One review per vendor-supplier-order combination
3. Multi-dimensional rating system
4. Supplier response capability
5. Review moderation and reporting

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Build Docker image
docker build -t bazaarsetu-api .

# Run with Docker Compose
docker-compose up -d
```

### Traditional Deployment
```bash
# Install dependencies
npm ci --production

# Set environment to production
export NODE_ENV=production

# Start application
npm start
```

## 🧪 Testing

```bash
# Run tests (if implemented)
npm test

# Run linting
npm run lint

# Check for security vulnerabilities
npm audit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@bazaarsetu.com or create an issue in this repository.

## 🏗️ Future Enhancements

- [ ] Real-time notifications with WebSocket
- [ ] Payment gateway integration
- [ ] SMS/Email notifications
- [ ] Advanced analytics and reporting
- [ ] Mobile app API optimization
- [ ] Multi-language support
- [ ] Inventory management system
- [ ] Delivery tracking integration

---

**Built with ❤️ for street food vendors and suppliers**

*BazaarSetu - Connecting the street food ecosystem*

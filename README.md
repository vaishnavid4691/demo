# BazaarSetu - Street Food Vendor Platform

A real-time web application connecting street food vendors with suppliers for affordable raw materials with health-safety checks and AI assistance.

## 🚀 Features

### Vendor Side
- **Home Screen**: Browse raw materials by category (Fruits, Veggies, Spices, etc.)
- **Shopping Cart**: Add items with total cost calculation
- **Health Label Checker**: Upload images to extract text using OCR and check for expiry/FSSAI license
- **Ask Anna Chatbot**: AI assistant in Hindi and English for product suggestions and safety queries

### Supplier Side
- **Authentication**: Login/Registration system
- **Product Management**: Upload products with name, price, category, stock, and FSSAI documents
- **Health Certificates**: Vendors can view supplier data and health certificates

### Additional Features
- **Multi-language Support**: English, Hindi, and Marathi
- **PDF Invoice Export**: Generate invoices from cart
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live data synchronization

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **OCR**: Tesseract.js for label scanning
- **AI**: OpenAI API for chatbot
- **Hosting**: Vercel + Firebase

## 📁 Project Structure

```
bazaarsetu/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Images and static files
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── database/              # Database setup and dummy data
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bazaarsetu
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore database
   - Add your Firebase config to `server/.env`

5. **Start the application**
   ```bash
   # Start backend (from server directory)
   npm run dev
   
   # Start frontend (from client directory)
   npm start
   ```

## 📊 Dummy Data

The application includes:
- 5 suppliers with complete profiles
- 10 raw materials across different categories
- 3 FSSAI certificate samples
- Test user accounts for both vendors and suppliers

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```
PORT=5000
MONGODB_URI=your_mongodb_uri
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

**Client (.env)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add new product (supplier only)
- `PUT /api/products/:id` - Update product (supplier only)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/:id` - Remove item from cart

### Health Checker
- `POST /api/health-checker/scan` - Scan product label

### Chatbot
- `POST /api/chatbot/ask` - Ask Anna chatbot

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Vaishnavi Dhage** - Initial work

---

**BazaarSetu** - Connecting street food vendors with quality suppliers! 🍽️

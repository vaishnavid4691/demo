# 🥘 BazaarSetu - Street Food Vendors Marketplace

**BazaarSetu** is a real-time web application designed to help street food vendors find raw materials at affordable prices with health-safety (FSSAI) checks and AI assistance.

## 🚀 Features

### 👥 Dual User Roles
- **Vendors**: Street food vendors looking for raw materials
- **Suppliers**: Raw material suppliers with FSSAI certification

### 🏠 Vendor Side Features
- **Home Screen**: Browse raw materials by category (Fruits, Vegetables, Spices, Grains, Dairy, Meat)
- **Shopping Cart**: Add to cart functionality with total cost calculation
- **Health Label Checker**: 
  - Upload product images
  - OCR text extraction using Tesseract.js
  - Check for FSSAI license and expiry dates
  - Health score assessment
- **Ask Anna Chatbot**: AI assistant supporting Hindi, English, and Marathi
- **PDF Invoice**: Generate and download invoices from cart

### 🏪 Supplier Side Features
- **Dashboard**: Comprehensive supplier management interface
- **Product Management**: Add, edit, and manage product listings
- **Order Tracking**: View and manage incoming orders
- **Document Upload**: Upload FSSAI certificates and business licenses
- **Analytics**: Revenue tracking and performance metrics

### 🌍 Additional Features
- **Multi-language Support**: English, Hindi, Marathi
- **Responsive Design**: Mobile-first approach
- **Real-time Data**: All data stored in Firebase/MongoDB
- **Health Safety**: FSSAI certification verification
- **PDF Export**: Invoice generation with itemized billing

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Tesseract.js** - OCR for label scanning
- **jsPDF** - PDF generation
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Elegant notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase Admin SDK** - Backend Firebase integration
- **CORS & Helmet** - Security middleware
- **Rate Limiting** - API protection

### Database & Authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Auth** - User authentication
- **Firebase Storage** - File storage

### AI & APIs
- **OpenAI API** - AI chatbot (Ask Anna)
- **Tesseract.js** - OCR text extraction

## 📁 Project Structure

```
bazaarsetu/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── hooks/          # Custom hooks
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Data models
│   ├── config/             # Configuration
│   └── package.json
├── database/               # Database scripts
├── .env.example           # Environment variables template
└── README.md
```

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- OpenAI API key (optional for AI features)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd bazaarsetu
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (client + server)
npm run install-all
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env
```

Fill in your environment variables in `.env`:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server)
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Enable Storage
5. Generate service account key
6. Copy configuration to `.env` file

### 5. Run the Application

```bash
# Development mode (runs both client and server)
npm run dev

# Or run separately:
# Client only
npm run client

# Server only
npm run server
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Status**: http://localhost:5000/api/status

## 📱 Demo Credentials

For testing purposes, you can use these demo accounts:

**Vendor Account:**
- Email: `vendor@bazaarsetu.com`
- Password: `password123`

**Supplier Account:**
- Email: `supplier@bazaarsetu.com`
- Password: `password123`

## 🎯 Key Components

### Health Label Checker
Upload product images to automatically:
- Extract text using OCR
- Identify FSSAI license numbers
- Check expiry dates
- Generate health safety scores
- Provide recommendations

### Ask Anna AI Chatbot
- Multi-language support (EN/HI/MR)
- Food safety guidance
- Storage recommendations
- Nutritional advice
- FSSAI certification help

### Smart Shopping Cart
- Real-time price calculation
- Quantity management
- Persistent storage
- PDF invoice generation
- GST calculation

## 🛡️ Security Features

- **Rate Limiting**: API call limits
- **CORS Protection**: Cross-origin security
- **Helmet.js**: Security headers
- **Firebase Auth**: Secure authentication
- **Input Validation**: Data sanitization
- **Environment Variables**: Secure configuration

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Build the client
cd client
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Deploy server to Railway
cd server
railway deploy

# Or deploy to Heroku
heroku create bazaarsetu-api
git push heroku main
```

### Environment Variables
Remember to set all environment variables in your deployment platform.

## 📊 Sample Data

The application includes comprehensive test data:

### 5 Suppliers
1. **Green Valley Farms** - Organic vegetables and fruits
2. **Rice Mills Ltd.** - Rice and grains
3. **Spice Masters** - Spices and masalas
4. **Dairy Fresh** - Dairy products
5. **Poultry Farm** - Meat and poultry

### 10 Raw Materials
- Fresh Tomatoes, Onions, Apples, Bananas
- Basmati Rice, Wheat Flour
- Turmeric Powder, Red Chili Powder
- Fresh Milk, Fresh Chicken

### 3 FSSAI Certificate Samples
- Sample certificates for testing health checker
- Various formats for OCR testing
- Valid/invalid license number examples

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tesseract.js** for OCR functionality
- **Tailwind CSS** for beautiful styling
- **Firebase** for backend services
- **OpenAI** for AI assistance
- **Lucide** for icons
- **Unsplash** for sample images

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Email: support@bazaarsetu.com
- Documentation: [Wiki](https://github.com/yourusername/bazaarsetu/wiki)

---

**Built with ❤️ for Indian street food vendors and suppliers**

> "Connecting vendors with quality suppliers for safer, better food"

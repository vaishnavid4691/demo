# BazaarSetu Backend

A real-time web app backend connecting street food vendors with verified suppliers for raw food materials.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- RESTful API
- bcrypt for password hashing

## Features
- User Authentication (Register/Login, Vendor/Supplier)
- Secure password hashing
- JWT token-based authentication
- Role-Based Access (Vendor/Supplier)
- Verified Suppliers (admin verification)
- Raw Material Management (Suppliers add/update/delete, Vendors browse/filter/search)
- Cart System (Vendors add to cart)
- Order System (Vendors place orders, Suppliers notified, Order status)
- Health & Safety (FSSAI check for suppliers)
- Product & Supplier Reviews (Vendors rate/review suppliers)

## Setup
1. Clone the repo
2. Install dependencies: `npm install`
3. Set up `.env` (see example in repo)
4. Start MongoDB locally
5. Run server: `npm run dev`

## API Endpoints
- `/api/auth/register` - Register (Vendor/Supplier)
- `/api/auth/login` - Login
- `/api/suppliers/verify` - Admin verifies supplier
- `/api/suppliers/verified` - Vendors get verified suppliers
- `/api/raw-materials/` - Supplier CRUD, Vendor browse/filter/search
- `/api/cart/` - Vendor cart management
- `/api/orders/` - Vendor place order, Supplier get/update orders
- `/api/reviews/` - Vendor add review, get supplier reviews

---
MIT License

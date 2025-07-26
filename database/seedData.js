const { db } = require('../server/config/firebase');
const bcrypt = require('bcryptjs');

// Dummy data for seeding the database
const seedData = {
  users: [
    // Suppliers
    {
      uid: 'supplier1',
      email: 'freshfruits@example.com',
      password: 'password123',
      name: 'Fresh Fruits Supplier',
      role: 'supplier',
      phone: '+91-9876543210',
      address: '123 Fruit Market, Mumbai, Maharashtra',
      businessName: 'Fresh Fruits Co.',
      fssaiLicense: 'FSSAI123456789',
      fssaiVerified: true,
      rating: 4.5,
      reviewCount: 12,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      uid: 'supplier2',
      email: 'veggieworld@example.com',
      password: 'password123',
      name: 'Veggie World',
      role: 'supplier',
      phone: '+91-9876543211',
      address: '456 Vegetable Lane, Pune, Maharashtra',
      businessName: 'Veggie World Enterprises',
      fssaiLicense: 'FSSAI987654321',
      fssaiVerified: true,
      rating: 4.2,
      reviewCount: 8,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      uid: 'supplier3',
      email: 'spiceking@example.com',
      password: 'password123',
      name: 'Spice King',
      role: 'supplier',
      phone: '+91-9876543212',
      address: '789 Spice Street, Nagpur, Maharashtra',
      businessName: 'Spice King Traders',
      fssaiLicense: 'FSSAI456789123',
      fssaiVerified: true,
      rating: 4.8,
      reviewCount: 15,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    },
    {
      uid: 'supplier4',
      email: 'dairyfresh@example.com',
      password: 'password123',
      name: 'Dairy Fresh',
      role: 'supplier',
      phone: '+91-9876543213',
      address: '321 Dairy Road, Kolhapur, Maharashtra',
      businessName: 'Dairy Fresh Products',
      fssaiLicense: 'FSSAI789123456',
      fssaiVerified: true,
      rating: 4.3,
      reviewCount: 10,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      uid: 'supplier5',
      email: 'grainsplus@example.com',
      password: 'password123',
      name: 'Grains Plus',
      role: 'supplier',
      phone: '+91-9876543214',
      address: '654 Grain Avenue, Aurangabad, Maharashtra',
      businessName: 'Grains Plus Suppliers',
      fssaiLicense: 'FSSAI321654987',
      fssaiVerified: true,
      rating: 4.6,
      reviewCount: 18,
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05')
    },
    // Vendors
    {
      uid: 'vendor1',
      email: 'streetfood@example.com',
      password: 'password123',
      name: 'Street Food Vendor',
      role: 'vendor',
      phone: '+91-9876543215',
      address: 'Street Food Corner, Mumbai, Maharashtra',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      uid: 'vendor2',
      email: 'foodcart@example.com',
      password: 'password123',
      name: 'Food Cart Owner',
      role: 'vendor',
      phone: '+91-9876543216',
      address: 'Food Cart Zone, Pune, Maharashtra',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    }
  ],
  products: [
    {
      name: 'Fresh Apples',
      description: 'Sweet and juicy red apples, perfect for street food',
      price: 120.00,
      category: 'Fruits',
      stock: 50,
      unit: 'kg',
      supplierId: 'supplier1',
      supplierName: 'Fresh Fruits Supplier',
      fssaiLicense: 'FSSAI123456789',
      expiryDate: '2024-04-15',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes, ideal for street food preparation',
      price: 40.00,
      category: 'Vegetables',
      stock: 100,
      unit: 'kg',
      supplierId: 'supplier2',
      supplierName: 'Veggie World',
      fssaiLicense: 'FSSAI987654321',
      expiryDate: '2024-03-20',
      imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      name: 'Premium Turmeric Powder',
      description: 'Pure turmeric powder for authentic Indian street food',
      price: 180.00,
      category: 'Spices',
      stock: 25,
      unit: 'kg',
      supplierId: 'supplier3',
      supplierName: 'Spice King',
      fssaiLicense: 'FSSAI456789123',
      expiryDate: '2025-01-25',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    },
    {
      name: 'Fresh Milk',
      description: 'Pure cow milk, perfect for tea and coffee',
      price: 60.00,
      category: 'Dairy',
      stock: 200,
      unit: 'liters',
      supplierId: 'supplier4',
      supplierName: 'Dairy Fresh',
      fssaiLicense: 'FSSAI789123456',
      expiryDate: '2024-02-10',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      name: 'Basmati Rice',
      description: 'Premium quality basmati rice for biryani and pulao',
      price: 80.00,
      category: 'Grains',
      stock: 150,
      unit: 'kg',
      supplierId: 'supplier5',
      supplierName: 'Grains Plus',
      fssaiLicense: 'FSSAI321654987',
      expiryDate: '2025-06-01',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05')
    },
    {
      name: 'Fresh Onions',
      description: 'Large red onions, essential for Indian street food',
      price: 30.00,
      category: 'Vegetables',
      stock: 200,
      unit: 'kg',
      supplierId: 'supplier2',
      supplierName: 'Veggie World',
      fssaiLicense: 'FSSAI987654321',
      expiryDate: '2024-04-01',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22')
    },
    {
      name: 'Garam Masala',
      description: 'Traditional garam masala blend for authentic taste',
      price: 220.00,
      category: 'Spices',
      stock: 30,
      unit: 'kg',
      supplierId: 'supplier3',
      supplierName: 'Spice King',
      fssaiLicense: 'FSSAI456789123',
      expiryDate: '2025-03-15',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      createdAt: new Date('2024-01-28'),
      updatedAt: new Date('2024-01-28')
    },
    {
      name: 'Fresh Bananas',
      description: 'Sweet yellow bananas, great for snacks and desserts',
      price: 80.00,
      category: 'Fruits',
      stock: 75,
      unit: 'dozen',
      supplierId: 'supplier1',
      supplierName: 'Fresh Fruits Supplier',
      fssaiLicense: 'FSSAI123456789',
      expiryDate: '2024-03-05',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    },
    {
      name: 'Paneer',
      description: 'Fresh homemade paneer for street food dishes',
      price: 300.00,
      category: 'Dairy',
      stock: 40,
      unit: 'kg',
      supplierId: 'supplier4',
      supplierName: 'Dairy Fresh',
      fssaiLicense: 'FSSAI789123456',
      expiryDate: '2024-02-15',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      createdAt: new Date('2024-02-03'),
      updatedAt: new Date('2024-02-03')
    },
    {
      name: 'Wheat Flour',
      description: 'Fine wheat flour for making rotis and breads',
      price: 45.00,
      category: 'Grains',
      stock: 300,
      unit: 'kg',
      supplierId: 'supplier5',
      supplierName: 'Grains Plus',
      fssaiLicense: 'FSSAI321654987',
      expiryDate: '2025-08-01',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      createdAt: new Date('2024-02-08'),
      updatedAt: new Date('2024-02-08')
    }
  ],
  fssaiLicenses: [
    {
      licenseNumber: 'FSSAI123456789',
      holderName: 'Fresh Fruits Supplier',
      businessName: 'Fresh Fruits Co.',
      address: '123 Fruit Market, Mumbai, Maharashtra',
      expiryDate: '2025-12-31',
      status: 'active',
      verified: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      licenseNumber: 'FSSAI987654321',
      holderName: 'Veggie World',
      businessName: 'Veggie World Enterprises',
      address: '456 Vegetable Lane, Pune, Maharashtra',
      expiryDate: '2025-10-15',
      status: 'active',
      verified: true,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      licenseNumber: 'FSSAI456789123',
      holderName: 'Spice King',
      businessName: 'Spice King Traders',
      address: '789 Spice Street, Nagpur, Maharashtra',
      expiryDate: '2025-06-30',
      status: 'active',
      verified: true,
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25')
    }
  ],
  reviews: [
    {
      supplierId: 'supplier1',
      userId: 'vendor1',
      userName: 'Street Food Vendor',
      rating: 5,
      comment: 'Excellent quality fruits, very fresh and reasonably priced!',
      createdAt: new Date('2024-01-20')
    },
    {
      supplierId: 'supplier1',
      userId: 'vendor2',
      userName: 'Food Cart Owner',
      rating: 4,
      comment: 'Good quality products, delivery is always on time.',
      createdAt: new Date('2024-01-22')
    },
    {
      supplierId: 'supplier2',
      userId: 'vendor1',
      userName: 'Street Food Vendor',
      rating: 4,
      comment: 'Fresh vegetables, good variety available.',
      createdAt: new Date('2024-01-25')
    },
    {
      supplierId: 'supplier3',
      userId: 'vendor2',
      userName: 'Food Cart Owner',
      rating: 5,
      comment: 'Best spices in the market, authentic taste!',
      createdAt: new Date('2024-01-28')
    }
  ]
};

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed users
    console.log('📝 Seeding users...');
    for (const user of seedData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const userData = { ...user, password: hashedPassword };
      delete userData.uid;
      
      await db.collection('users').doc(user.uid).set(userData);
    }

    // Seed products
    console.log('🛍️ Seeding products...');
    for (const product of seedData.products) {
      await db.collection('products').add(product);
    }

    // Seed FSSAI licenses
    console.log('📋 Seeding FSSAI licenses...');
    for (const license of seedData.fssaiLicenses) {
      await db.collection('fssaiLicenses').add(license);
    }

    // Seed reviews
    console.log('⭐ Seeding reviews...');
    for (const review of seedData.reviews) {
      await db.collection('reviews').add(review);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded data:
    - ${seedData.users.length} users (${seedData.users.filter(u => u.role === 'supplier').length} suppliers, ${seedData.users.filter(u => u.role === 'vendor').length} vendors)
    - ${seedData.products.length} products
    - ${seedData.fssaiLicenses.length} FSSAI licenses
    - ${seedData.reviews.length} reviews`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Function to clear the database
async function clearDatabase() {
  try {
    console.log('🧹 Clearing database...');

    const collections = ['users', 'products', 'fssaiLicenses', 'reviews', 'carts', 'orders', 'healthScans', 'chatHistory'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`🗑️ Cleared ${collectionName} collection`);
    }

    console.log('✅ Database cleared successfully!');

  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
}

// Export functions
module.exports = {
  seedDatabase,
  clearDatabase,
  seedData
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}
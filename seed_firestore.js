const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin with explicit project ID
initializeApp({
  projectId: 'spherical-aviary-hfs6l'
});

// Explicit database ID from config
const db = getFirestore('ai-studio-sewacenter-db3acc57-a796-48c9-ade1-bdc097a42e0c');
const auth = getAuth();

async function seed() {
  try {
    console.log('--- Seeding Firestore ---');

    // 1. Categories
    const categories = [
      { id: 'plumbing', name: 'Plumbing', slug: 'plumbing', description: 'Expert plumbing services', imageUrl: 'https://images.unsplash.com/photo-1581244276891-996b6f03028d?q=80&w=500' },
      { id: 'electrical', name: 'Electrical', slug: 'electrical', description: 'Certified electrical repairs', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=500' },
      { id: 'cleaning', name: 'Cleaning', slug: 'cleaning', description: 'Professional home cleaning', imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=500' }
    ];

    for (const cat of categories) {
      await db.collection('categories').doc(cat.id).set({
        ...cat,
        createdAt: FieldValue.serverTimestamp()
      });
      console.log(`- Seeded category: ${cat.name}`);
    }

    // 2. Catalog Services
    const catalogServices = [
      { id: 'pipe-repair', categoryId: 'plumbing', name: 'Pipe Repair', slug: 'pipe-repair', serviceType: 'FIXED_PRICE', basePrice: 500, isActive: true },
      { id: 'drain-cleaning', categoryId: 'plumbing', name: 'Drain Cleaning', slug: 'drain-cleaning', serviceType: 'FIXED_PRICE', basePrice: 800, isActive: true },
      { id: 'ac-repair', categoryId: 'electrical', name: 'AC Repair', slug: 'ac-repair', serviceType: 'INSPECTION_BASED', inspectionFee: 300, isActive: true }
    ];

    for (const service of catalogServices) {
      await db.collection('catalogServices').doc(service.id).set({
        ...service,
        createdAt: FieldValue.serverTimestamp()
      });
      console.log(`- Seeded catalog service: ${service.name}`);
    }

    // 3. Create Customer User (as requested)
    const customerEmail = 'customer@example.com';
    const customerPassword = 'password123';
    
    let customerUser;
    try {
      customerUser = await auth.getUserByEmail(customerEmail);
      console.log(`- Customer user already exists: ${customerEmail}`);
    } catch (err) {
      customerUser = await auth.createUser({
        email: customerEmail,
        password: customerPassword,
        displayName: 'John Customer'
      });
      console.log(`- Created customer user: ${customerEmail}`);
    }

    await db.collection('users').doc(customerUser.uid).set({
      name: 'John Customer',
      email: customerEmail,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 4. Create Provider User (Ram Bahadur)
    const providerEmail = 'provider1@example.com';
    let providerUser;
    try {
      providerUser = await auth.getUserByEmail(providerEmail);
    } catch (err) {
      providerUser = await auth.createUser({
        email: providerEmail,
        password: 'password123',
        displayName: 'Ram Bahadur'
      });
    }

    await db.collection('users').doc(providerUser.uid).set({
      name: 'Ram Bahadur',
      email: providerEmail,
      role: 'PROVIDER',
      status: 'ACTIVE',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    // 5. Provider Profile
    await db.collection('providerProfiles').doc(providerUser.uid).set({
      userId: providerUser.uid,
      categoryId: 'plumbing',
      businessName: 'Ram Plumbing Solutions',
      bio: 'Professional plumber with 10 years experience.',
      location: 'Kathmandu',
      skills: ['Pipe Repair', 'Drain Cleaning'],
      experience: '10 years',
      price: 500,
      verified: true,
      averageRating: 4.8,
      reviewCount: 15,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log(`- Seeded provider profile: Ram Bahadur`);

    console.log('--- Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    process.exit();
  }
}

seed();

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for GearUp...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const providerPassword = await bcrypt.hash('Provider123!', 10);
  const customerPassword = await bcrypt.hash('Customer123!', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gearup.com' },
    update: {},
    create: {
      name: 'GearUp System Admin',
      email: 'admin@gearup.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Seed Provider User
  const provider = await prisma.user.upsert({
    where: { email: 'provider@gearup.com' },
    update: {},
    create: {
      name: 'Apex Outdoor Rentals',
      email: 'provider@gearup.com',
      password: providerPassword,
      role: UserRole.PROVIDER,
    },
  });
  console.log('✅ Provider user created:', provider.email);

  // 3. Seed Customer User
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gearup.com' },
    update: {},
    create: {
      name: 'John Doe Customer',
      email: 'customer@gearup.com',
      password: customerPassword,
      role: UserRole.CUSTOMER,
    },
  });
  console.log('✅ Customer user created:', customer.email);

  // 4. Seed Gear Categories
  const categories = [
    { name: 'Cycling & Biking', description: 'Mountain bikes, road bikes, and helmets' },
    { name: 'Camping & Hiking', description: 'Tents, sleeping bags, stoves, and backpacks' },
    { name: 'Water Sports', description: 'Kayaks, paddleboards, and life jackets' },
    { name: 'Winter Sports', description: 'Skis, snowboards, and thermal gear' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Categories seeded successfully');

  // Fetch created categories
  const campingCategory = await prisma.category.findUnique({ where: { name: 'Camping & Hiking' } });
  const cyclingCategory = await prisma.category.findUnique({ where: { name: 'Cycling & Biking' } });

  // 5. Seed Gear Listings
  if (campingCategory && cyclingCategory) {
    const gearListings = [
      {
        title: 'Ultra-Lightweight 2-Person Backpacking Tent',
        description: 'Waterproof double-layer 2-person tent ideal for trail camping.',
        pricePerDay: 25.0,
        brand: 'REI Co-op',
        location: 'Denver, CO',
        stock: 5,
        categoryId: campingCategory.id,
        providerId: provider.id,
      },
      {
        title: 'Full-Suspension Mountain Bike (29er)',
        description: 'High-performance mountain bike built for rugged off-road trails.',
        pricePerDay: 45.0,
        brand: 'Trek',
        location: 'Boulder, CO',
        stock: 3,
        categoryId: cyclingCategory.id,
        providerId: provider.id,
      },
    ];

    for (const gearItem of gearListings) {
      await prisma.gear.create({
        data: gearItem,
      });
    }
    console.log('✅ Sample gear listings created');
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

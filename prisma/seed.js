const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ---------- Institutions ----------
  const institutions = [
    // Schools
    { name: 'Royal College', type: 'SCHOOL' },
    { name: 'British School In Colombo', type: 'SCHOOL' },
    { name: "S. Thomas' College", type: 'SCHOOL' },
    { name: "Ladies' College", type: 'SCHOOL' },
    { name: 'Ananda College', type: 'SCHOOL' },
    { name: 'Visakha Vidyalaya', type: 'SCHOOL' },
    { name: 'D.S. Senanayake College', type: 'SCHOOL' },
    { name: 'Colombo International School', type: 'SCHOOL' },
    { name: 'Lyceum International School', type: 'SCHOOL' },
    { name: 'Gateway College', type: 'SCHOOL' },
    // Universities
    { name: 'University of Colombo', type: 'UNIVERSITY' },
    { name: 'University of Peradeniya', type: 'UNIVERSITY' },
    { name: 'University of Moratuwa', type: 'UNIVERSITY' },
    { name: 'University of Kelaniya', type: 'UNIVERSITY' },
    { name: 'University of Sri Jayewardenepura', type: 'UNIVERSITY' },
    { name: 'Eastern University (ECU)', type: 'UNIVERSITY' },
    { name: 'University College London (UCL)', type: 'UNIVERSITY' },
    { name: 'Sri Lanka Institute of Information Technology (SLIIT)', type: 'UNIVERSITY' },
    { name: 'NSBM Green University', type: 'UNIVERSITY' },
    { name: 'IIT Sri Lanka', type: 'UNIVERSITY' },
    { name: 'APIIT Sri Lanka', type: 'UNIVERSITY' },
    { name: 'Aquinas College of Higher Studies', type: 'UNIVERSITY' },
  ];

  for (const inst of institutions) {
    await prisma.institution.upsert({
      where: { name: inst.name },
      update: {},
      create: inst,
    });
  }
  console.log(`✅ Seeded ${institutions.length} institutions`);

  // ---------- Categories ----------
  const categories = [
    { name: 'Food & Drink', slug: 'food-drink', icon: '🍔', description: 'Restaurants, cafes, and beverages' },
    { name: 'Travel', slug: 'travel', icon: '✈️', description: 'Rides, hotels, and travel experiences' },
    { name: 'Fashion', slug: 'fashion', icon: '👗', description: 'Clothing, accessories, and style' },
    { name: 'Health & Fitness', slug: 'health-fitness', icon: '💪', description: 'Gyms, wellness, and health products' },
    { name: 'Entertainment', slug: 'entertainment', icon: '🎬', description: 'Movies, events, and leisure' },
    { name: 'Home & Utility', slug: 'home-utility', icon: '🏠', description: 'Appliances, electronics, and home essentials' },
    { name: 'Tech & Mobile', slug: 'tech-mobile', icon: '📱', description: 'Mobile plans, gadgets, and tech services' },
    { name: 'Books', slug: 'books', icon: '📚', description: 'Bookshops, stationery, and learning resources' },
    { name: 'Gifts & Flowers', slug: 'gifts-flowers', icon: '🎁', description: 'Gifts, flowers, and special occasions' },
    { name: 'Finance', slug: 'finance', icon: '💳', description: 'Banking, fintech, and financial services' },
    { name: 'Beauty', slug: 'beauty', icon: '💄', description: 'Spas, salons, and beauty products' },
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // ---------- Brands ----------
  const brands = [
    // Food & Drink
    { name: 'Pizza Hut', description: 'World-famous pizza chain with student deals', categorySlug: 'food-drink' },
    { name: 'KFC', description: 'Finger-lickin\' good chicken at student prices', categorySlug: 'food-drink' },
    { name: 'Burger King', description: 'Have it your way with exclusive student offers', categorySlug: 'food-drink' },
    { name: 'Java Lounge', description: 'Premium café experience for students', categorySlug: 'food-drink' },
    { name: 'Tea Avenue', description: 'Sri Lanka\'s finest tea house with student specials', categorySlug: 'food-drink' },
    // Travel
    { name: 'PickMe', description: 'Sri Lanka\'s favorite ride-hailing app', categorySlug: 'travel' },
    { name: 'Uber', description: 'Get rides at student-friendly prices', categorySlug: 'travel' },
    { name: 'Cinnamon Hotels & Resorts', description: 'Luxury stays at student rates', categorySlug: 'travel' },
    // Fashion
    { name: 'ODEL', description: 'Sri Lanka\'s premier fashion destination', categorySlug: 'fashion' },
    { name: 'Fashion Bug', description: 'Trendy fashion at affordable prices', categorySlug: 'fashion' },
    { name: 'Cool Planet', description: 'Cool styles for the young generation', categorySlug: 'fashion' },
    { name: 'Bear Appeal', description: 'Casual wear with student exclusives', categorySlug: 'fashion' },
    // Health & Fitness
    { name: 'Power World Gyms', description: 'Get fit with discounted memberships', categorySlug: 'health-fitness' },
    { name: 'Carnage', description: 'Intense workouts at student prices', categorySlug: 'health-fitness' },
    { name: 'Fitness First', description: 'Premium fitness with student plans', categorySlug: 'health-fitness' },
    // Entertainment
    { name: 'Scope Cinemas', description: 'Watch the latest movies for less', categorySlug: 'entertainment' },
    { name: 'Concerts & Events', description: 'Live events and concerts at student rates', categorySlug: 'entertainment' },
    { name: 'Pearl Bay', description: 'Leisure and entertainment experiences', categorySlug: 'entertainment' },
    // Home & Utility
    { name: 'Singer Sri Lanka', description: 'Home appliances and electronics', categorySlug: 'home-utility' },
    { name: 'Abans', description: 'Quality electronics and home solutions', categorySlug: 'home-utility' },
    // Tech & Mobile
    { name: 'Dialog Axiata', description: 'Sri Lanka\'s leading telecom provider', categorySlug: 'tech-mobile' },
    { name: 'Mobitel', description: 'Mobile plans tailored for students', categorySlug: 'tech-mobile' },
    { name: 'Hutch Sri Lanka', description: 'Affordable data and call plans', categorySlug: 'tech-mobile' },
    // Books
    { name: 'Sarasavi Bookshop', description: 'Largest bookshop chain in Sri Lanka', categorySlug: 'books' },
    { name: 'Vijitha Yapa', description: 'Books, stationery, and more', categorySlug: 'books' },
    // Gifts & Flowers
    { name: 'Kapruka', description: 'Online gifts and delivery service', categorySlug: 'gifts-flowers' },
    { name: 'Wishque', description: 'Premium gifting made easy', categorySlug: 'gifts-flowers' },
    // Finance
    { name: 'Commercial Bank of Ceylon', description: 'Student banking solutions', categorySlug: 'finance' },
    { name: 'Sampath Bank', description: 'Student-friendly banking', categorySlug: 'finance' },
    { name: 'FriMi', description: 'Digital banking for the young generation', categorySlug: 'finance' },
    // Beauty
    { name: 'Spa Ceylon', description: 'Luxury spa treatments for students', categorySlug: 'beauty' },
    { name: 'British Cosmetics', description: 'Beauty products at student prices', categorySlug: 'beauty' },
    { name: 'My Salon', description: 'Haircare and beauty services', categorySlug: 'beauty' },
  ];

  const brandMap = {};
  for (const brand of brands) {
    const created = await prisma.brand.upsert({
      where: { id: brand.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() },
      update: {},
      create: {
        name: brand.name,
        description: brand.description,
        categoryId: categoryMap[brand.categorySlug],
      },
    });
    brandMap[brand.name] = created.id;
  }
  console.log(`✅ Seeded ${brands.length} brands`);

  // ---------- Sample Offers ----------
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const offers = [
    { title: '20% Off Any Large Pizza', description: 'Get 20% off any large pizza when you show your student ID', discount: '20%', brandName: 'Pizza Hut', categorySlug: 'food-drink', maxRedemptions: 500 },
    { title: 'Student Combo Meal - Rs. 999', description: 'Exclusive student combo with 2pc chicken, fries, and a drink', discount: 'Rs. 999', brandName: 'KFC', categorySlug: 'food-drink', maxRedemptions: 1000 },
    { title: 'Buy 1 Get 1 Free Whopper', description: 'Buy one Whopper and get another one absolutely free', discount: 'BOGO', brandName: 'Burger King', categorySlug: 'food-drink', maxRedemptions: 300 },
    { title: '15% Off All Beverages', description: 'Enjoy 15% off all hot and cold beverages at Java Lounge', discount: '15%', brandName: 'Java Lounge', categorySlug: 'food-drink' },
    { title: 'Student Tea Tasting - Rs. 500', description: 'Exclusive tea tasting experience for students', discount: 'Rs. 500', brandName: 'Tea Avenue', categorySlug: 'food-drink' },
    { title: 'Rs. 200 Off Your First Ride', description: 'New student users get Rs. 200 off their first PickMe ride', discount: 'Rs. 200 Off', brandName: 'PickMe', categorySlug: 'travel', maxRedemptions: 2000 },
    { title: '25% Off Weekend Rides', description: 'Get 25% off all weekend rides with Uber', discount: '25%', brandName: 'Uber', categorySlug: 'travel' },
    { title: 'Student Staycation - 40% Off', description: 'Enjoy a luxury staycation at 40% off room rates', discount: '40%', brandName: 'Cinnamon Hotels & Resorts', categorySlug: 'travel', maxRedemptions: 100 },
    { title: '30% Off New Collection', description: 'Get 30% off the latest fashion collection at ODEL', discount: '30%', brandName: 'ODEL', categorySlug: 'fashion' },
    { title: 'Student Shopping Day - 25% Off', description: 'Every Thursday is student day! Get 25% off everything', discount: '25%', brandName: 'Fashion Bug', categorySlug: 'fashion' },
    { title: 'Buy 2 Get 1 Free T-Shirts', description: 'Mix and match any 3 t-shirts and pay for only 2', discount: 'Buy 2 Get 1', brandName: 'Cool Planet', categorySlug: 'fashion' },
    { title: '20% Off All Casual Wear', description: 'Exclusive 20% discount on all casual wear items', discount: '20%', brandName: 'Bear Appeal', categorySlug: 'fashion' },
    { title: 'Student Gym Pass - Rs. 3,500/month', description: 'Special monthly membership rate for students', discount: 'Rs. 3,500/mo', brandName: 'Power World Gyms', categorySlug: 'health-fitness' },
    { title: 'Free Trial Week', description: 'One week free trial for all new student members', discount: 'Free Trial', brandName: 'Carnage', categorySlug: 'health-fitness', maxRedemptions: 200 },
    { title: '50% Off First Month', description: 'Half price on your first month of membership', discount: '50%', brandName: 'Fitness First', categorySlug: 'health-fitness' },
    { title: 'Student Movie Ticket - Rs. 500', description: 'Any movie, any time, flat Rs. 500 for students', discount: 'Rs. 500', brandName: 'Scope Cinemas', categorySlug: 'entertainment' },
    { title: '30% Off Concert Tickets', description: 'Get 30% off selected live events and concerts', discount: '30%', brandName: 'Concerts & Events', categorySlug: 'entertainment' },
    { title: 'Beach Day Pass - Rs. 1,500', description: 'All-day beach experience at a student-friendly price', discount: 'Rs. 1,500', brandName: 'Pearl Bay', categorySlug: 'entertainment' },
    { title: '15% Off All Electronics', description: 'Student discount on laptops, phones, and accessories', discount: '15%', brandName: 'Singer Sri Lanka', categorySlug: 'home-utility' },
    { title: 'Student Appliance Bundle Deal', description: 'Special bundle pricing on essential appliances', discount: 'Bundle Deal', brandName: 'Abans', categorySlug: 'home-utility' },
    { title: 'Student Data Plan - 30GB for Rs. 499', description: 'Massive data plan exclusively for verified students', discount: 'Rs. 499', brandName: 'Dialog Axiata', categorySlug: 'tech-mobile', maxRedemptions: 5000 },
    { title: 'Free 5GB Data Bonus', description: 'Get 5GB extra data on any monthly plan', discount: '5GB Free', brandName: 'Mobitel', categorySlug: 'tech-mobile' },
    { title: 'Student SIM Pack - Rs. 199', description: 'Special SIM starter pack with bonus data and calls', discount: 'Rs. 199', brandName: 'Hutch Sri Lanka', categorySlug: 'tech-mobile' },
    { title: '20% Off All Books', description: 'Student discount on all books and stationery', discount: '20%', brandName: 'Sarasavi Bookshop', categorySlug: 'books' },
    { title: 'Buy 3 Books Get 1 Free', description: 'Build your library with this student-exclusive offer', discount: 'Buy 3 Get 1', brandName: 'Vijitha Yapa', categorySlug: 'books' },
    { title: 'Rs. 500 Off Gift Orders', description: 'Rs. 500 off any gift order above Rs. 2,000', discount: 'Rs. 500 Off', brandName: 'Kapruka', categorySlug: 'gifts-flowers' },
    { title: '15% Off Premium Gift Boxes', description: 'Exclusive discount on curated gift boxes', discount: '15%', brandName: 'Wishque', categorySlug: 'gifts-flowers' },
    { title: 'Zero Fee Student Account', description: 'Open a student savings account with zero monthly fees', discount: 'Zero Fees', brandName: 'Commercial Bank of Ceylon', categorySlug: 'finance' },
    { title: 'Student Credit Card - No Annual Fee', description: 'Apply for a student credit card with no annual fee for 2 years', discount: 'No Annual Fee', brandName: 'Sampath Bank', categorySlug: 'finance' },
    { title: 'Free FriMi Premium for 6 Months', description: 'Get FriMi Premium features free for 6 months', discount: '6 Mo Free', brandName: 'FriMi', categorySlug: 'finance' },
    { title: '35% Off Spa Treatments', description: 'Luxury spa treatments at 35% off for students', discount: '35%', brandName: 'Spa Ceylon', categorySlug: 'beauty' },
    { title: '25% Off All Beauty Products', description: 'Student discount on cosmetics and skincare', discount: '25%', brandName: 'British Cosmetics', categorySlug: 'beauty' },
    { title: 'Student Haircut - Rs. 800', description: 'Professional haircut and styling at student rates', discount: 'Rs. 800', brandName: 'My Salon', categorySlug: 'beauty' },
  ];

  for (const offer of offers) {
    await prisma.offer.create({
      data: {
        title: offer.title,
        description: offer.description,
        discount: offer.discount,
        terms: 'Valid student verification required. Cannot be combined with other offers. Subject to availability.',
        brandId: brandMap[offer.brandName],
        categoryId: categoryMap[offer.categorySlug],
        expiresAt: nextYear,
        isActive: true,
        maxRedemptions: offer.maxRedemptions || null,
      },
    });
  }
  console.log(`✅ Seeded ${offers.length} offers`);

  // ---------- Admin User ----------
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@unisavers.lk' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@unisavers.lk',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      verificationStatus: 'APPROVED',
    },
  });
  console.log('✅ Seeded admin user (admin@unisavers.lk / admin123)');

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

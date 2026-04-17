const mongoose = require('mongoose');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is missing in .env');
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    await ServiceCategory.deleteMany({});
    await SubService.deleteMany({});
    console.log('Cleared existing categories and subservices.');

    const categories = [
      { name: 'Healthcare Services', icon: '🏥', description: 'Medical, nursing, and healthcare support.' },
      { name: 'Legal Services', icon: '⚖️', description: 'Expert legal advice and representation.' },
      { name: 'Education & Tutoring', icon: '🎓', description: 'Academic support and skill development.' },
      { name: 'Professional Services', icon: '💼', description: 'Accounting, marketing, and business consulting.' },
      { name: 'Local & Home Services', icon: '🏠', description: 'Plumbing, cleaning, and general repairs.' },
    ];

    const createdCategories = await ServiceCategory.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories.`);

    const subServices = [
      // Healthcare
      { categoryId: createdCategories[0]._id, name: 'Home Nursing', priceRange: '$50-$200', duration: 120 },
      { categoryId: createdCategories[0]._id, name: 'Physiotherapy', priceRange: '$40-$100', duration: 60 },
      // Legal
      { categoryId: createdCategories[1]._id, name: 'Family Law', priceRange: '$100-$500', duration: 60 },
      { categoryId: createdCategories[1]._id, name: 'Corporate Legal', priceRange: '$200-$1000', duration: 60 },
      // Education
      { categoryId: createdCategories[2]._id, name: 'Math Tutoring', priceRange: '$30-$60', duration: 60 },
      { categoryId: createdCategories[2]._id, name: 'Language Tutors', priceRange: '$25-$50', duration: 60 },
      // Professional
      { categoryId: createdCategories[3]._id, name: 'Tax Consultation', priceRange: '$50-$150', duration: 45 },
      { categoryId: createdCategories[3]._id, name: 'IT Support', priceRange: '$40-$120', duration: 60 },
      // Local & Home
      { categoryId: createdCategories[4]._id, name: 'Electrical Repair', priceRange: '$40-$150', duration: 60 },
      { categoryId: createdCategories[4]._id, name: 'Deep Cleaning', priceRange: '$60-$300', duration: 180 },
    ];

    await SubService.insertMany(subServices);
    console.log('Created sub-services.');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Location = require('./models/Location');
const FAQ = require('./models/FAQ');

const categories = [
    { name: 'Home Cleaning', status: 'approved' },
    { name: 'Plumbing', status: 'approved' },
    { name: 'Electrical', status: 'approved' },
    { name: 'Appliance Repair', status: 'approved' },
    { name: 'Painting', status: 'approved' },
    { name: 'Carpentry', status: 'approved' },
    { name: 'Pest Control', status: 'approved' },
    { name: 'Moving Services', status: 'approved' },
];

const locations = [
    { city_name: 'New York, NY', status: 'approved' },
    { city_name: 'Los Angeles, CA', status: 'approved' },
    { city_name: 'Chicago, IL', status: 'approved' },
    { city_name: 'Houston, TX', status: 'approved' },
    { city_name: 'Phoenix, AZ', status: 'approved' },
];

const faqs = [
    // User FAQs
    { question: 'How do I book a service?', answer: 'Go to the Services page, find a service you need, and click "Book Now". Follow the steps to choose a time slot and confirm your booking.', role: 'user', category: 'Bookings', is_highlighted: true },
    { question: 'Can I cancel a booking?', answer: 'Yes, you can cancel a booking from the "My Bookings" page as long as it hasn\'t started yet. Navigate to your booking and click "Cancel".', role: 'user', category: 'Bookings', is_highlighted: false },
    { question: 'How do I pay for services?', answer: 'Payment is handled at the time of booking. We accept all major payment methods. Your payment is secure and encrypted.', role: 'user', category: 'Payments', is_highlighted: false },
    { question: 'What happens if a provider doesn\'t show up?', answer: 'If a provider doesn\'t show up, please contact our support team immediately. We will rebook or issue a full refund within 24 hours.', role: 'user', category: 'Bookings', is_highlighted: true },
    { question: 'How do I add an address to my profile?', answer: 'Go to Account Settings → Profile tab. Fill in the "Default Service Address" fields and click "Save Account Details".', role: 'user', category: 'Account', is_highlighted: false },
    { question: 'How do I change my password?', answer: 'Navigate to Account Settings → Security tab. Enter your new password, confirm it, and click "Update Password".', role: 'user', category: 'Account', is_highlighted: false },
    // Provider FAQs
    { question: 'How do I get approved as a provider?', answer: 'After signing up as a provider, an admin will review your profile. Once approved, your services will be visible to customers.', role: 'provider', category: 'Getting Started', is_highlighted: true },
    { question: 'How do I set my availability?', answer: 'Go to the Schedule tab in your Provider Dashboard. You can set your working hours and days off.', role: 'provider', category: 'Schedule', is_highlighted: false },
    { question: 'How do I complete a service?', answer: 'Ask the customer for their 6-digit PIN in the "Bookings" tab. Enter the PIN to mark the service as complete and receive payment.', role: 'provider', category: 'Bookings', is_highlighted: true },
    { question: 'How do I manage my services?', answer: 'Go to the Services tab in your dashboard to add, edit, or remove the services you offer.', role: 'provider', category: 'Services', is_highlighted: false },
    // General FAQs
    { question: 'Is my data safe on CityServe?', answer: 'Yes. We use industry-standard encryption and never share your personal information with third parties without your consent.', role: 'general', category: 'Privacy', is_highlighted: true },
    { question: 'How does CityServe work?', answer: 'CityServe connects customers with qualified local service providers. You book, the provider arrives, completes the job, and you confirm with a unique PIN.', role: 'general', category: 'About', is_highlighted: true },
    { question: 'What cities are available?', answer: 'CityServe is currently available in multiple cities. You can check the available locations on our Locations page.', role: 'general', category: 'Coverage', is_highlighted: false },
];

const seedData = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }

        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Database connected.');

        // Clear existing data
        await Category.deleteMany();
        await Location.deleteMany();
        await User.deleteMany();
        await FAQ.deleteMany();
        console.log('🗑️  Old data cleared.');

        // Seed categories, locations, and FAQs
        await Category.insertMany(categories);
        await Location.insertMany(locations);
        await FAQ.insertMany(faqs);
        console.log('📦 Categories, locations, and FAQs seeded.');

        // Create default users
        await User.create([
            { name: 'System Admin', email: 'admin@cityserve.com', password: 'admin123', role: 'admin' },
            { name: 'Expert Plumber', email: 'provider@cityserve.com', password: 'provider123', role: 'provider', phone: '1234567890' },
            { name: 'John Doe', email: 'user@cityserve.com', password: 'user123', role: 'user' }
        ]);

        console.log('👤 Default users created.');
        console.log('');
        console.log('✅ Database Seeded Successfully!');
        console.log('');
        console.log('   Admin:    admin@cityserve.com    / admin123');
        console.log('   Provider: provider@cityserve.com / provider123');
        console.log('   Customer: user@cityserve.com     / user123');
        process.exit();
    } catch (error) {
        console.error(`❌ Seeding Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();

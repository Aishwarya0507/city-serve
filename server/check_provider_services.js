const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const ServiceSchema = new mongoose.Schema({
    provider: mongoose.Schema.Types.ObjectId,
    title: String
}, { collection: 'services' });

const Service = mongoose.model('Service', ServiceSchema);

async function checkServices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const providers = [
            '69d9e5f7a4f9ec606ae2b4d0', // Expert Plumber
            '69d9ea4125cc4b7e03d0fec9', // Tirupathi
            '69db822f1636aebd395b2bdf'  // Test Provider
        ];

        for (const pid of providers) {
            const count = await Service.countDocuments({ provider: new mongoose.Types.ObjectId(pid) });
            console.log(`Provider ${pid} has ${count} services.`);
            if (count > 0) {
                const list = await Service.find({ provider: new mongoose.Types.ObjectId(pid) }, 'title');
                list.forEach(s => console.log(` - ${s.title}`));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkServices();

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://aishwarya57:admin0507@cluster0.rpfz5yt.mongodb.net/?appName=Cluster0').then(async () => {
  const User = require('./models/User');
  const admins = await User.find({ role: { $in: ['admin', 'provider'] } }).select('email role password');
  console.log(JSON.stringify(admins, null, 2));
  mongoose.disconnect();
}).catch(console.error);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'admin@nutriai.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@1234', salt);

    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@nutriai.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log(`Admin user created successfully: ${adminUser.email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();

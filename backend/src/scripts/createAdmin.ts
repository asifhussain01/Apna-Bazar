import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { config } from '../config/config';
import { User } from '../models/User';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[CreateAdmin] Connected to database');

    const phoneInput = await askQuestion('Enter Admin Mobile Number (10 digits): ');
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '').slice(-10);

    if (cleanPhone.length !== 10) {
      console.error('Invalid mobile number. Must be 10 digits.');
      process.exit(1);
    }

    const nameInput = await askQuestion('Enter Admin Full Name: ');
    const passwordInput = await askQuestion('Enter Admin Password (min 6 characters): ');

    if (!passwordInput || passwordInput.length < 6) {
      console.error('Password must be at least 6 characters.');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordInput, salt);

    let user = await User.findOne({ phoneNumber: cleanPhone });

    if (user) {
      user.role = 'admin';
      user.fullName = nameInput.trim();
      user.passwordHash = passwordHash;
      await user.save();
      console.log(`[CreateAdmin] User ${cleanPhone} upgraded to Admin successfully.`);
    } else {
      user = await User.create({
        phoneNumber: cleanPhone,
        fullName: nameInput.trim(),
        role: 'admin',
        passwordHash,
        languagePreference: 'hi'
      });
      console.log(`[CreateAdmin] Created new Admin account for ${cleanPhone}.`);
    }

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('[CreateAdmin] Error creating admin:', error);
    rl.close();
    process.exit(1);
  }
};

createAdmin();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const exercisesToUpdate = [
  {
    name: /Push.*up/i,
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000'
  },
  {
    name: /Squat/i,
    thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000'
  },
  {
    name: /Run|Jog/i,
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000'
  },
  {
    name: /Yoga/i,
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000'
  },
  {
    name: /HIIT|Tabata/i,
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000'
  },
  {
    name: /Plank/i,
    thumbnail: 'https://images.unsplash.com/photo-1566241142559-40e1bfc26ebc?q=80&w=1000'
  },
  {
    name: /Bench|Chest.*Press/i,
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000'
  },
  {
    name: /Row/i,
    thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?q=80&w=1000'
  },
  {
    name: /Crunch|Sit.*up|Abs/i,
    thumbnail: 'https://images.unsplash.com/photo-1517838276537-8d22f8084555?q=80&w=1000'
  },
  {
    name: /Lunge/i,
    thumbnail: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?q=80&w=1000'
  },
  {
    name: /Cycle|Cycling|Bike/i,
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000'
  },
  {
    name: /Deadlift/i,
    thumbnail: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1000'
  }
];

async function updateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('exercises');

    for (const update of exercisesToUpdate) {
      const result = await collection.updateMany(
        { name: update.name },
        { $set: { thumbnail: update.thumbnail } }
      );
      console.log(`Updated ${result.modifiedCount} exercises matching ${update.name}`);
    }

    console.log('Finished updating exercise images.');
    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
}

updateImages();

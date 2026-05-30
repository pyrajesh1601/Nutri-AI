import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const specificUpdates = [
  {
    name: /Mountain.*Climber/i,
    thumbnail: 'https://images.unsplash.com/photo-1598971639058-aba7c12af4b2?q=80&w=1000'
  },
  {
    name: /Deadlift/i,
    thumbnail: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=1000'
  },
  {
    name: /Bench.*Press/i,
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000'
  },
  {
    name: /Burpee/i,
    thumbnail: 'https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?q=80&w=1000'
  },
  {
    name: /Hamstring.*Stretch/i,
    thumbnail: 'https://images.unsplash.com/photo-1441786485319-5e0f0c091523?q=80&w=1000'
  },
  {
    name: /Vinyasa.*Yoga/i,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000'
  }
];

async function updateSpecificImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('exercises');

    for (const update of specificUpdates) {
      const result = await collection.updateMany(
        { name: update.name },
        { $set: { thumbnail: update.thumbnail } }
      );
      console.log(`Updated ${result.modifiedCount} exercises matching ${update.name}`);
    }

    console.log('Specific image updates finished.');
    process.exit(0);
  } catch (error) {
    console.error('Update error:', error);
    process.exit(1);
  }
}

updateSpecificImages();

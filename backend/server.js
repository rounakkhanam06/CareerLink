import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRoutes from './routes/posts.routes.js';
import usersRoutes from './routes/user.route.js';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(postsRoutes);
app.use(usersRoutes);

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(path.resolve(), 'public')));

app.get('/', (req, res) => res.send('API running'));

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

start();


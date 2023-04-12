import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DB_URL as string, 
{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});


'use strict';

import mongoose from "mongoose";


export const dbConnection = async () =>{
    try {
        mongoose.connection.on('error', () => {
            console.log('Could not be connected to MongoDB 🛑');
            mongoose.disconnect();
        });

        mongoose.connection.on('connecting', () => {
            console.log('Try Connecting 🔌');
        });

        mongoose.connection.on('connected', async () => {
            console.log('Connected to MongoDB ✅');
        });
 
        mongoose.connection.on('open', ()=>{
            console.log('Connected to database 🌐');
        });
 
        mongoose.connection.on('reconnected', ()=>{
            console.log('Reconnected to MongoDB 🔄');
        });
 
        mongoose.connection.on('disconnected', ()=>{
            console.log('Disconnected ❌');
        });
 
        mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });
    }catch(error){
        console.log('Database connection failed 💥', error);
    }
}
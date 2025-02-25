'use strict';
import User from "../src/user/user.model.js";
import Category from '../src/category/category.model.js'
import mongoose from "mongoose";
import { hash } from "argon2";

export const dbConnection = async () => {
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
            try {
                const adminExists = await User.findOne({ role: "ADMIN" });
                if (!adminExists) {
                    const adminPassword = await hash("12345678"); 
                    await User.create({
                        name: "Elmer",
                        surname: "Santos",
                        username: "elmersantos",
                        email: "elmersantos@gmail.com",
                        password: adminPassword,
                        role: "ADMIN"
                    });
                    console.log("Administrator user created ✅");
                } else {
                    console.log("Administrator user already exists ⚠️");
                }
                const defaultCategory = await Category.findOne({ name: "Default" });
                if (!defaultCategory) {
                    await Category.create({ name: "Default" });
                    console.log("Default category created 📂");
                } else {
                    console.log("Default category already exists 🔄");
                }

            } catch (error) {
                console.error("Error verifying/creating admin or category ❌:", error);
            }
        });

        mongoose.connection.on('open', () => {
            console.log('Connected to database 🌐');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('Reconnected to MongoDB 🔄');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Disconnected ❌');
        });

        mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50,
        });
    } catch (error) {
        console.log('Database connection failed 💥', error);
    }
};
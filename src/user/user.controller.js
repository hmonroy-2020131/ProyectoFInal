import { response } from "express";
import { hash, verify } from "argon2";
import User from "./user.model.js";
import Invoice from "../invoice/invoice.model.js";

export const getUsers = async (req, res = response) => {
    try {
        const users = await User.find({estado: true}); 
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching users ❌',
            error,
        });
    }
};

export const updateUser = async (req, res = response) => {
    try {
        const userId = req.params.id;  
        const { password, newPassword, ...data } = req.body;

        if (userId !== req.usuario._id.toString()) {
            return res.status(401).json({
                success: false,
                msg: 'You can only update your own account ❌'
            });
        }

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                msg: 'User not found 🔍❌'
            });
        }

        if (newPassword) {
            if (!password) {
                return res.status(400).json({
                    success: false,
                    msg: 'You must enter your current password to change it 🔑🔒',
                });
            }

            const isMatch = await verify(existingUser.password, password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    msg: 'Current password is incorrect ❌🔑',
                });
            }

            data.password = await hash(newPassword); 
        }

        const user = await User.findByIdAndUpdate(userId, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'User updated successfully ✅',
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error updating user ❌',
            error,
        });
    }
};


export const deleteUser = async (req, res = response) => {
    try {
        const userId = req.params.id;
        const { password } = req.body;

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                msg: 'User not found 🔍❌',
            });
        }

        if (existingUser._id.toString() !== req.usuario._id.toString()) {
            return res.status(401).json({
                success: false,
                msg: 'You can only deactivate your own account ❌',
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                msg: 'You must enter your password to deactivate your account 🔑🔒',
            });
        }

        const isMatch = await verify(existingUser.password, password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                msg: 'Incorrect password ❌🔑',
            });
        }

        existingUser.estado = false;
        await existingUser.save(); 

        res.status(200).json({
            success: true,
            msg: 'User deactivated successfully ✅',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error deactivating user ❌',
            error,
        });
    }
};

export const updateUserRole = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["ADMIN", "CLIENT"].includes(role)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid role ❌",
            });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "User not found 🔍❌",
            });
        }

        res.status(200).json({
            success: true,
            msg: "User role updated ✅",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error updating user role ❌",
            error,
        });
    }
};

export const getUserInvoices = async (req, res = response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                msg: "User not found ❌" 
            });
        }

        const invoices = await Invoice.find({ user: id }).populate("products.product");

        if (!invoices.length) {
            return res.status(404).json({ 
                success: false, 
                msg: "No invoices found for this user ❌" 
            });
        }

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        console.error("Error fetching invoices ❌", error);
        res.status(500).json({ 
            success: false, 
            msg: "Error fetching invoices ❌", 
            error: error.message 
        });
    }
};

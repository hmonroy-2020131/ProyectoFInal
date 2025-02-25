import { response } from "express";
import { hash, verify } from "argon2";
import User from "./user.model.js";

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

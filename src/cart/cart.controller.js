import { response } from "express";
import Cart from "./cart.model.js";

export const getCart = async (req, res = response) => {
    try {
        const cart = await Cart.findOne({ user: req.usuario._id }).populate("products.product");
        if (!cart) {
            return res.status(404).json({
                success: false,
                msg: "Cart not found ❌"
            });
        }
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Error fetching cart ❌", error });
    }
};

export const addToCart = async (req, res = response) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ user: req.usuario._id });

        if (!cart) {
            cart = new Cart({ user: req.usuario._id, products: [] });
        }

        const existingProductIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        res.status(200).json({ success: true, msg: "Product added to cart ✅", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Error adding product to cart ❌", error });
    }
};

export const updateCart = async (req, res = response) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.usuario._id });

        if (!cart) {
            return res.status(404).json({ success: false, msg: "Cart not found ❌" });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({ success: false, msg: "Product not found in cart ❌" });
        }

        cart.products[productIndex].quantity = quantity;
        await cart.save();
        res.status(200).json({ success: true, msg: "Cart updated ✅", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Error updating cart ❌", error });
    }
};

export const removeFromCart = async (req, res = response) => {
    try {
        const { productId } = req.params;
        const cart = await Cart.findOne({ user: req.usuario._id });

        if (!cart) {
            return res.status(404).json({ success: false, msg: "Cart not found ❌" });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== productId);
        await cart.save();
        res.status(200).json({ success: true, msg: "Product removed from cart ✅", cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Error removing product from cart ❌", error });
    }
};

export const clearCart = async (req, res = response) => {
    try {
        await Cart.findOneAndDelete({ user: req.usuario._id });
        res.status(200).json({ success: true, msg: "Cart deleted completely ✅" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Error deleting cart ❌", error });
    }
};

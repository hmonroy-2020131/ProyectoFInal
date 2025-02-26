import { response } from "express";
import Cart from "./cart.model.js";
import Invoice from "../invoice/invoice.model.js";
import Product from "../product/product.model.js";

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

export const addInvoice = async (req, res = response) => {
    try {
        const cart = await Cart.findOne({ user: req.usuario._id }).populate("products.product");
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ success: false, msg: "Cart is empty ❌" });
        }

        let total = 0;
        for (const item of cart.products) {
            if (!item.product || item.product.stock < item.quantity) {
                return res.status(400).json({ success: false, msg: `Not enough stock for ${item.product?.name || "Unknown Product"} ❌` });
            }
            total += parseFloat(item.product.price) * item.quantity;
        }

        const invoice = new Invoice({
            user: req.usuario._id,
            products: cart.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            })),
            total
        });
        await invoice.save();

        for (const item of cart.products) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity, sold: item.quantity }
            }, { new: true });
        }

        await Cart.findOneAndDelete({ user: req.usuario._id });
        res.status(201).json({ success: true, msg: "Purchase completed ✅ Invoice created", invoice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: "Error completing purchase ❌", error });
    }
};


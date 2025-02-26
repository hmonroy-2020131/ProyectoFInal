import { response } from "express";
import Product from "./product.model.js";

export const getProducts = async (req, res = response) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching products ❌',
            error,
        });
    }
};

export const getProductById = async (req, res = response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: 'Product not found 🔍❌'
            });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching product ❌',
            error,
        });
    }
};

export const getTopSellingProducts = async (req, res = response) => {
    try {
        const topProducts = await Product.find().sort({ sold: -1 }).limit(3);
        if (!topProducts.length) {
            return res.status(404).json({
                success: false,
                msg: 'No top-selling products found ❌'
            });
        }
        res.status(200).json({
            success: true,
            count: topProducts.length,
            products: topProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching top selling products ❌',
            error,
        });
    }
};

export const getOutOfStockProducts = async (req, res = response) => {
    try {
        const outOfStockProducts = await Product.find({ stock: 0 });
        res.status(200).json({
            success: true,
            outOfStockProducts,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching out of stock products ❌',
            error,
        });
    }
};

export const getProductsByCategory = async (req, res = response) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category: category });
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error fetching products by category ❌',
            error,
        });
    }
};

export const searchProducts = async (req, res = response) => {
    try {
        const { name, category } = req.query;
        const query = {};
        if (name) query.name = { $regex: name, $options: "i" };
        if (category) query.category = category;
        const products = await Product.find(query);
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error searching products ❌',
            error,
        });
    }
};

export const createProduct = async (req, res = response) => {
    try {
        const { name, price, stock, category, description } = req.body;
        if (!description) {
            return res.status(400).json({
                success: false,
                msg: 'Description is required ❌'
            });
        }
        const newProduct = new Product({ name, price, stock, category, description, sales: 0 });
        await newProduct.save();
        res.status(201).json({ success: true, msg: 'Product created ✅', newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error creating product ❌',
            error,
        });
    }
};

export const updateProduct = async (req, res = response) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, msg: 'Product not found ❌' });
        }
        res.json({ success: true, msg: 'Product updated ✅', updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error updating product ❌',
            error,
        });
    }
};

export const deleteProduct = async (req, res = response) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ success: false, msg: 'Product not found ❌' });
        }
        res.json({ success: true, msg: 'Product deleted ✅' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error deleting product ❌',
            error,
        });
    }
};

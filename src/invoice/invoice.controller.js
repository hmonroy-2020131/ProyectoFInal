import { response } from "express";
import Invoice from "../invoice/invoice.model.js";
import Product from "../product/product.model.js";

export const updateProductQuantity = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { productId, quantity } = req.body;

        let invoice = await Invoice.findById(id).populate("products.product");
        if (!invoice) {
            return res.status(404).json({
                success: false,
                msg: "Invoice not found ❌",
            });
        }

        const productIndex = invoice.products.findIndex(item => item.product._id.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                msg: "Product not found in invoice ❌",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: "Product not found in database ❌",
            });
        }

        const oldQuantity = invoice.products[productIndex].quantity;
        const quantityDifference = quantity - oldQuantity;

        if (product.stock < quantityDifference) {
            return res.status(400).json({
                success: false,
                msg: "Not enough stock ❌",
            });
        }

        invoice.products[productIndex].quantity = quantity;
        invoice.total = invoice.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        await invoice.save();

        await Product.findByIdAndUpdate(productId, {
            $inc: { stock: -quantityDifference, sold: quantityDifference }
        }, { new: true });

        res.status(200).json({
            success: true,
            msg: "Product quantity updated ✅",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error updating product quantity ❌",
            error,
        });
    }
};

export const addProductToInvoice = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { productId, quantity } = req.body;

        let invoice = await Invoice.findById(id).populate("products.product");
        if (!invoice) {
            return res.status(404).json({
                success: false,
                msg: "Invoice not found ❌",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: `Product not found in database ❌ - Product ID: ${productId}`,
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                msg: "Not enough stock ❌",
            });
        }

        invoice.products.push({ product: productId, quantity });
        await invoice.populate("products.product");
        invoice.total = invoice.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        await invoice.save();

        await Product.findByIdAndUpdate(productId, {
            $inc: { stock: -quantity, sold: quantity }
        }, { new: true });

        res.status(200).json({
            success: true,
            msg: "Product added to invoice ✅",
        });
    } catch (error) {
        console.error("Error adding product to invoice", error);
        res.status(500).json({
            success: false,
            msg: "Error adding product to invoice ❌",
            error: error.message,
        });
    }
};

export const removeProductFromInvoice = async (req, res = response) => {
    try {
        const { id, productId } = req.params;

        let invoice = await Invoice.findById(id).populate("products.product");
        if (!invoice) {
            return res.status(404).json({
                success: false,
                msg: "Invoice not found ❌",
            });
        }

        const productIndex = invoice.products.findIndex(item => item.product && item.product._id.toString() === productId);
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                msg: `Product not found in invoice ❌ - Product ID: ${productId}`,
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                msg: `Product not found in database ❌ - Product ID: ${productId}`,
            });
        }

        const removedQuantity = invoice.products[productIndex].quantity;
        invoice.products.splice(productIndex, 1);
        invoice.total = invoice.products.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
        await invoice.save();

        await Product.findByIdAndUpdate(productId, {
            $inc: { stock: removedQuantity, sold: -removedQuantity }
        }, { new: true });

        res.status(200).json({
            success: true,
            msg: "Product removed from invoice ✅",
        });
    } catch (error) {
        console.error("Error removing product from invoice", error);
        res.status(500).json({
            success: false,
            msg: "Error removing product from invoice ❌",
            error: error.message,
        });
    }
};

export const updateInvoiceStatus = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        let invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                msg: "Invoice not found ❌",
            });
        }

        invoice.estado = estado;
        await invoice.save();

        res.status(200).json({
            success: true,
            msg: "Invoice status updated ✅",
            invoice,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error updating invoice status ❌",
            error,
        });
    }
};

export const removeInvoice = async (req, res = response) => {
    try {
        const { id } = req.params;
        let invoice = await Invoice.findById(id).populate("products.product");
        if (!invoice) {
            return res.status(404).json({
                success: false,
                msg: "Invoice not found ❌",
            });
        }

        for (const item of invoice.products) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: item.quantity, sold: -item.quantity }
            }, { new: true });
        }

        await Invoice.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            msg: "Invoice deleted successfully ✅",
        });
    } catch (error) {
        console.error("Error deleting invoice", error);
        res.status(500).json({
            success: false,
            msg: "Error deleting invoice ❌",
            error: error.message,
        });
    }
};

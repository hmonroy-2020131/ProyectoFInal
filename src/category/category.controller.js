import { response } from "express";
import Category from './category.model.js';
import Product from '../product/product.model.js';  

export const createCategory = async (req, res = response) => {
    try {
        const { name } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                msg: "Category already exists ⚠️"
            });
        }

        const newCategory = new Category({ name });
        await newCategory.save();

        res.status(201).json({
            success: true,
            msg: "Category created successfully ✅",
            category: newCategory
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error creating category ❌",
            error
        });
    }
};

export const getCategories = async (req, res = response) => {
    try {
        const categories = await Category.find({ estado: true }); 
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error fetching categories ❌",
            error
        });
    }
};

export const updateCategory = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                msg: "Category not found 🔍❌"
            });
        }

        category.name = name || category.name;
        await category.save();

        res.status(200).json({
            success: true,
            msg: "Category updated successfully ✅",
            category
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error updating category ❌",
            error
        });
    }
};

export const deleteCategory = async (req, res = response) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                msg: "Category not found 🔍❌"
            });
        }

        const defaultCategory = await Category.findOne({ name: "Default" });
        if (!defaultCategory) {
            return res.status(400).json({
                success: false,
                msg: "Default category not found 🔍❌"
            });
        }

        await Product.updateMany({ category: category._id }, { category: defaultCategory._id });

        category.estado = false;
        await category.save();

        res.status(200).json({
            success: true,
            msg: "Category deleted successfully (transferred products to default) ✅"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error deleting category ❌",
            error
        });
    }
};

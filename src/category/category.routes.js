import { Router } from "express";
import { check } from "express-validator";
import { createCategory, getCategories, updateCategory, deleteCategory } from './category.controller.js';
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";  
import { tieneRole } from "../middlewares/validar-roles.js"; 

const router = Router();

router.get(
    "/",
    getCategories
);

router.post(
    "/",
    [
        validarJWT,
        tieneRole('ADMIN'), 
        check("name", "Category name is required ✋").not().isEmpty(),
        validarCampos
    ],
    createCategory
);

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole('ADMIN'), 
        check("id", "Invalid ID").isMongoId(),
        validarCampos
    ],
    updateCategory
);

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole('ADMIN'), 
        check("id", "Invalid ID").isMongoId(),
        validarCampos
    ],
    deleteCategory
);

export default router;

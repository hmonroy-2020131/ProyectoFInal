import { Router } from "express";
import { check } from "express-validator";
import { updateProductQuantity, addProductToInvoice, removeProductFromInvoice, updateInvoiceStatus, removeInvoice } from "./invoice.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.put(
    "/update-quantity/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "Invalid ID").isMongoId(),
        validarCampos
    ],
    updateProductQuantity
);

router.put(
    "/add-product/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "Invalid ID").isMongoId(),
        validarCampos
    ],
    addProductToInvoice
);

router.delete(
    "/remove-product/:id/:productId",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "Invalid ID").isMongoId(),
        check("productId", "Invalid Product ID").isMongoId(),
        validarCampos
    ],
    removeProductFromInvoice
);

router.put(
    "/update-status/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "Invalid ID").isMongoId(),
        validarCampos
    ],
    updateInvoiceStatus
);

router.delete(
    "/delete/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "Invalid ID").isMongoId(),
        validarCampos
    ],
    removeInvoice
);

export default router;

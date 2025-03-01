import { Router } from "express";
import { check } from "express-validator";
import { updateUser, deleteUser, getUsers, updateUserRole, getUserInvoices} from "./user.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { existeUsuarioById } from "../helpers/db-validator.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.get(
    '/',
    getUsers
);

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN", "CLIENT"),
        check("id", "Invalid ID").isMongoId(),
        check("id").custom(existeUsuarioById),
        check("email").optional().isEmail(),
        validarCampos,
    ],
    updateUser
);

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN", "CLIENT"),
        check("id", "Invalid ID").isMongoId(),
        check("id").custom(existeUsuarioById),
        validarCampos,
    ],
    deleteUser
);

router.put(
    "/update-role/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "Invalid ID").isMongoId(),
        check("role", "Invalid role").isIn(["ADMIN", "CLIENT"]),
        validarCampos,
    ],
    updateUserRole
);

router.get(
    "/history/:id",
    [
        validarJWT,
        check("id", "Invalid ID").isMongoId(),
        validarCampos,
    ],
    getUserInvoices
);

export default router;

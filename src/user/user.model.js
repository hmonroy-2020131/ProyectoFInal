import { Schema, model } from "mongoose";

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        maxLength: [25, "Can't exceed 25 characters"]
    },
    surname: {
        type: String,
        required: [true, "Surname is required"],
        maxLength: [25, "Can't exceed 25 characters"]
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLength: [8, "Password must be at least 8 characters long"]
    },
    role: {
        type: String,
        required: true,
        enum: ["ADMIN", "CLIENT"],
        default: "CLIENT"
    },
    estado: {
        type: Boolean,
        default: true
    },
    
}, {
    timestamps: true,
    versionKey: false
});

UserSchema.methods.toJSON = function () {
    const { __v, password, _id, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
};

export default model('User', UserSchema);
import { Schema, model } from "mongoose";

const InvoiceSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"] }
        }
    ],
    total: {
        type: Number,
        required: true,
        min: [0, "Total must be a positive number"]
    },
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Invoice', InvoiceSchema);
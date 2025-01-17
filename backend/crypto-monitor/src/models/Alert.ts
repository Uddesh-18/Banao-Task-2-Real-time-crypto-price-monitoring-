import { Schema, model } from 'mongoose';

const alertSchema = new Schema({
    user: String,
    email: String,
    crypto: String,
    price: Number,
    condition: String, // 'above' or 'below'
});

const Alert = model('Alert', alertSchema);
export default Alert;

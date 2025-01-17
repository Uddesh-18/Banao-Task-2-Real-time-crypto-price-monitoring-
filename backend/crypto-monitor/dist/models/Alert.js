"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const alertSchema = new mongoose_1.Schema({
    user: String,
    email: String,
    crypto: String,
    price: Number,
    condition: String, // 'above' or 'below'
});
const Alert = (0, mongoose_1.model)('Alert', alertSchema);
exports.default = Alert;

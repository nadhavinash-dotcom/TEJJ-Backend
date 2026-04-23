"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDatabase() {
    const uri = process.env.MONGODB_URI;
    if (!uri)
        throw new Error('MONGODB_URI is not set');
    await mongoose_1.default.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
}
async function disconnectDatabase() {
    await mongoose_1.default.disconnect();
}
//# sourceMappingURL=database.js.map
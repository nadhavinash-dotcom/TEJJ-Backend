"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loan = void 0;
const mongoose_1 = require("mongoose");
const loanSchema = new mongoose_1.Schema({
    worker_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    retain_enrollment_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RetainEnrollment', required: true },
    loan_amount: { type: Number, required: true },
    emi_total: { type: Number, required: true },
    emi_employer_contribution: { type: Number, default: 600 },
    emi_worker: { type: Number, required: true },
    disbursement_date: Date,
    loan_partner: { type: String, default: 'Shriram Finance', enum: ['Shriram Finance', 'Bajaj Finserv', 'IIFL', 'Other'] },
    status: { type: String, default: 'APPLIED', enum: ['APPLIED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'DEFAULTED'] },
}, { timestamps: { createdAt: 'created_at' } });
exports.Loan = (0, mongoose_1.model)('Loan', loanSchema);
//# sourceMappingURL=Loan.js.map
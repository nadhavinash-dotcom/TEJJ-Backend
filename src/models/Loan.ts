import { Schema, model, Document } from 'mongoose';

export interface ILoan extends Document {
  worker_id: Schema.Types.ObjectId;
  retain_enrollment_id: Schema.Types.ObjectId;
  loan_amount: number;
  emi_total: number;
  emi_employer_contribution: number;
  emi_worker: number;
  disbursement_date?: Date;
  loan_partner: string;
  status: string;
  created_at: Date;
}

const loanSchema = new Schema<ILoan>({
  worker_id: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
  retain_enrollment_id: { type: Schema.Types.ObjectId, ref: 'RetainEnrollment', required: true },
  loan_amount: { type: Number, required: true },
  emi_total: { type: Number, required: true },
  emi_employer_contribution: { type: Number, default: 600 },
  emi_worker: { type: Number, required: true },
  disbursement_date: Date,
  loan_partner: { type: String, default: 'Shriram Finance', enum: ['Shriram Finance', 'Bajaj Finserv', 'IIFL', 'Other'] },
  status: { type: String, default: 'APPLIED', enum: ['APPLIED', 'APPROVED', 'ACTIVE', 'COMPLETED', 'DEFAULTED'] },
}, { timestamps: { createdAt: 'created_at' } });

export const Loan = model<ILoan>('Loan', loanSchema);

import mongoose, { type Document, Schema } from "mongoose";

export interface IPayment extends Document {
  loan: mongoose.Types.ObjectId;
  collectedBy: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    collectedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    amount: { type: Number, required: true, min: 1 },
    paymentDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

import { Schema, model, Model, Document } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// properties that are required to create a new order
export interface IPayment {
  orderId: string;
  stripeId: string;
}

// combining properties to model a document interface
interface PaymentDoc extends IPayment, Document {
  version: number;
  createdAt?: boolean | string;
  updatedAt?: boolean | string;
}

// properties that a payment model has
interface PaymentModel extends Model<PaymentDoc> {
  build(attrs: IPayment): PaymentDoc;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, required: true },
  },
  {
    timestamps: true,
    // while converting to json, the order model uses this configuration
    // to output json that matches to the definition given here
    toJSON: {
      versionKey: false,
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

paymentSchema.set("versionKey", "version");
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attrs: IPayment) => {
  return new Payment(attrs);
};

export const Payment = model<PaymentDoc, PaymentModel>("Payment", paymentSchema);

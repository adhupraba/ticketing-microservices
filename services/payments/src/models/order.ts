import { OrderStatus } from "@trensetickets/packages/types";
import { Schema, model, Model, Document } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// properties that are required to create a new order
export interface IOrder {
  id: string;
  userId: string;
  status: OrderStatus;
  price: number;
  version: number;
}

// combining properties to model a document interface
interface OrderDoc extends Omit<IOrder, "id">, Document {
  createdAt?: boolean | string;
  updatedAt?: boolean | string;
}

// properties that a order model has
interface OrderModel extends Model<OrderDoc> {
  build(attrs: IOrder): OrderDoc;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(OrderStatus), default: OrderStatus.Created },
    price: { type: Number, required: true },
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: IOrder) => {
  const { id, ...rest } = attrs;
  return new Order({ _id: id, ...rest });
};

export const Order = model<OrderDoc, OrderModel>("Order", orderSchema);

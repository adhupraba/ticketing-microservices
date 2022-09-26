import { OrderStatus } from "@trensetickets/packages/types";
import { Schema, model, Model, Document } from "mongoose";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// properties that are required to create a new order
export interface IOrder {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

// combining properties to model a document interface
interface OrderDoc extends IOrder, Document {
  version: number;
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
    expiresAt: { type: Schema.Types.Date },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
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
  return new Order(attrs);
};

export const Order = model<OrderDoc, OrderModel>("Order", orderSchema);

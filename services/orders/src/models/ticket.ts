import { OrderStatus } from "@trensetickets/packages/types";
import { Schema, model, Model, Document } from "mongoose";
import { Order } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// properties that are required to create a new ticket
export interface ITicket {
  id: string;
  title: string;
  price: number;
}

// combining properties to model a document interface
export interface TicketDoc extends Omit<ITicket, "id">, Document {
  version: number;
  createdAt?: boolean | string;
  updatedAt?: boolean | string;
  isReserved(): Promise<boolean>;
}

type FindByEventParams = { id: string; version: number };

// properties that a ticket model has
interface TicketModel extends Model<TicketDoc> {
  build(attrs: ITicket): TicketDoc;
  findByEvent(event: FindByEventParams): Promise<TicketDoc | null>;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    // while converting to json, the ticket model uses this configuration
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: ITicket) => {
  const { id, ...rest } = attrs;
  return new Ticket({ _id: id, ...rest });
};

ticketSchema.statics.findByEvent = async (event: FindByEventParams) => {
  return Ticket.findOne({ _id: event.id, version: event.version - 1 });
};

ticketSchema.methods.isReserved = async function () {
  // this === THE TICKET DOCUMENT THAT WE JUST CALLED 'isReserved' ON
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete],
    },
  });

  console.log("existing order ===>", existingOrder?.toObject());

  return !!existingOrder;
};

export const Ticket = model<TicketDoc, TicketModel>("Ticket", ticketSchema);

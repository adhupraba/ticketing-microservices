import { Schema, model, Model, Document } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// properties that are required to create a new ticket
export interface ITicket {
  title: string;
  price: number;
  userId: string;
}

// combining properties to model a document interface
interface TicketDoc extends ITicket, Document {
  version: number;
  orderId?: string;
  createdAt?: boolean | string;
  updatedAt?: boolean | string;
}

// properties that a ticket model has
interface TicketModel extends Model<TicketDoc> {
  build(attrs: ITicket): TicketDoc;
}

const ticketSchema = new Schema<ITicket & Pick<TicketDoc, "orderId">>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: { type: String },
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
  return new Ticket(attrs);
};

export const Ticket = model<TicketDoc, TicketModel>("Ticket", ticketSchema);

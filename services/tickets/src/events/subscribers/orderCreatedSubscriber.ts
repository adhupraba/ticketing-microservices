import { OrderCreatedEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatedPublisher";

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = events.queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // FIND THE TICKET THAT THE ORDER IS RESERVING
    const ticket = await Ticket.findById(data.ticket.id);

    // IF NO TICKET, THROW ERROR
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // MARK THE TICKET AS BEING RESERVED BY SETTING ITS orderId PROPERTY
    ticket.set({ orderId: data.id });

    // SAVE THE TICKET
    await ticket.save();

    new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    // ACK THE MESSAGE
    msg.ack();
  }
}

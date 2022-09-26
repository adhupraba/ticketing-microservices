import { Subjects, Subscriber, TicketUpdatedEvent } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = events.queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, title, price, version } = data;
    const ticket = await Ticket.findByEvent({ id, version });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}

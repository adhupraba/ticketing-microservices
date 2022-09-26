import { OrderCreatedEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Order } from "../../models/order";

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = events.queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    console.log(
      `----------------- [${new Date().toLocaleString()}:${new Date().getMilliseconds()}] payments OrderCreatedSubscriber -----------------`
    );
    console.log(order.id, order.version);
    console.log("--------------------------------------------------------------------");

    msg.ack();
  }
}

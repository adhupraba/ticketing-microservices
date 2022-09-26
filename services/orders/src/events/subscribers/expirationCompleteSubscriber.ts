import { OrderStatus } from "@trensetickets/packages/types";
import { ExpirationCompleteEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers";

export class ExpirationCompleteSubscriber extends Subscriber<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = events.queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    console.log(
      `----------------- [${new Date().toLocaleString()}:${new Date().getMilliseconds()}] orders ExpirationCompleteSubscriber -----------------`
    );
    console.log("before =>", order.id, order.version, order.status);

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    console.log("after =>", order.id, order.version, order.status);
    console.log("--------------------------------------------------------------------");

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id },
    });

    msg.ack();
  }
}

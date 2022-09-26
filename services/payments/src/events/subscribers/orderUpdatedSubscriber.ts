import { OrderUpdatedEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Order } from "../../models/order";

export class OrderUpdatedSubscriber extends Subscriber<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
  queueGroupName = events.queueGroupName;

  async onMessage(data: OrderUpdatedEvent["data"], msg: Message) {
    const order = await Order.findOne({ id: data.id, version: data.version - 1 });

    if (!order) {
      throw new Error("Order not found");
    }

    console.log(
      `----------------- [${new Date().toLocaleString()}:${new Date().getMilliseconds()}] payments OrderUpdatedSubscriber -----------------`
    );
    console.log("before =>", order.id, order.version, order.status);

    order.set({ status: data.status });
    await order.save();

    console.log("after =>", order.id, order.version, order.status);
    console.log("--------------------------------------------------------------------");

    msg.ack();
  }
}

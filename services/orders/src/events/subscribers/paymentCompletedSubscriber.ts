import { OrderStatus } from "@trensetickets/packages/types";
import { PaymentCompletedEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Order } from "../../models/order";
import { OrderUpdatedPublisher } from "../publishers";

export class PaymentCompletedSubscriber extends Subscriber<PaymentCompletedEvent> {
  readonly subject = Subjects.PaymentCompleted;
  queueGroupName = events.queueGroupName;

  async onMessage(data: PaymentCompletedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    console.log(
      `----------------- [${new Date().toLocaleString()}:${new Date().getMilliseconds()}] orders PaymentCompletedSubscriber -----------------`
    );
    console.log("before =>", order.id, order.version, order.status);

    order.set({ status: OrderStatus.Complete });
    await order.save();

    console.log("after =>", order.id, order.version, order.status);
    console.log("--------------------------------------------------------------------");

    new OrderUpdatedPublisher(this.client).publish({
      id: order.id,
      status: OrderStatus.Complete,
      userId: order.userId,
      version: order.version,
    });

    msg.ack();
  }
}

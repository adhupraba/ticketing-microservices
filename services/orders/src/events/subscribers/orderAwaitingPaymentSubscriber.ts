import { OrderStatus } from "@trensetickets/packages/types";
import { OrderAwaitingPaymentEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Order } from "../../models/order";
import { OrderUpdatedPublisher } from "../publishers";

export class OrderAwaitingPaymentSubscriber extends Subscriber<OrderAwaitingPaymentEvent> {
  readonly subject = Subjects.OrderAwaitingPayment;
  queueGroupName = events.queueGroupName;

  async onMessage(data: OrderAwaitingPaymentEvent["data"], msg: Message) {
    const order = await Order.findById(data.id);

    if (!order) {
      throw new Error("Order not found");
    }

    console.log(
      `----------------- [${new Date().toLocaleString()}:${new Date().getMilliseconds()}] orders OrderAwaitingPaymentSubscriber -----------------`
    );
    console.log("before =>", order.id, order.version, order.status);

    order.set({ status: OrderStatus.AwaitingPayment });
    await order.save();

    console.log("after =>", order.id, order.version, order.status);
    console.log("--------------------------------------------------------------------");

    new OrderUpdatedPublisher(this.client).publish({
      id: order.id,
      status: OrderStatus.AwaitingPayment,
      userId: order.userId,
      version: order.version,
    });

    msg.ack();
  }
}

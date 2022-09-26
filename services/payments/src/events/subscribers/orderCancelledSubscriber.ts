import { OrderStatus } from "@trensetickets/packages";
import { OrderCancelledEvent, Subjects, Subscriber } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { events } from "../../constants";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = events.queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({ id: data.id, version: data.version - 1 });

    if (!order) {
      throw new Error("Order not found");
    }

    const payment = await Payment.findOne({ orderId: order.id });

    if (!payment) {
      throw new Error("Payment not found");
    }

    console.log(
      `----------------- [${new Date().toLocaleString()}:${new Date().getMilliseconds()}] payments OrderCancelledSubscriber -----------------`
    );
    console.log("before =>", order.id, order.version, order.status);

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    await stripe.paymentIntents.cancel(payment.stripeId);

    console.log("after =>", order.id, order.version, order.status);
    console.log("--------------------------------------------------------------------");

    msg.ack();
  }
}

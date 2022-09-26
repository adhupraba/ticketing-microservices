import { OrderStatus } from "@trensetickets/packages/types";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@trensetickets/packages/errors";
import { RequestHandler } from "express";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
import { natsWrapper } from "../natsWrapper";
import { OrderAwaitingPaymentPublisher } from "../events/publishers/orderAwaitingPaymentPublisher";

export const createPaymentIntent: RequestHandler = async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser?.id) {
    throw new UnauthorizedError();
  }

  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError("Cannot pay for a cancelled order");
  }

  if (order.status === OrderStatus.Complete) {
    throw new BadRequestError("Cannot pay for an already paid order");
  }

  let clientSecret: string | null;
  let message: string;

  if (order.status === OrderStatus.AwaitingPayment) {
    const payment = await Payment.findOne({ orderId: order.id });

    if (!payment) {
      throw new BadRequestError("Payment details not found");
    }

    const foundIntent = await stripe.paymentIntents.retrieve(payment.stripeId);

    clientSecret = foundIntent.client_secret;
    message = "Payment intent retrieved";

    console.log(message);
  } else {
    const intent = await stripe.paymentIntents.create({
      // convert price from rupees to paise
      amount: order.price * 100,
      currency: "INR",
      metadata: {
        orderId: order.id,
      },
    });

    clientSecret = intent.client_secret;
    message = "Payment intent created";

    const payment = Payment.build({
      orderId: orderId,
      stripeId: intent.id,
    });
    await payment.save();

    new OrderAwaitingPaymentPublisher(natsWrapper.client).publish({
      id: order.id,
      status: OrderStatus.AwaitingPayment,
    });

    console.log(message);
  }

  return res.status(201).send({ clientSecret, message });
};

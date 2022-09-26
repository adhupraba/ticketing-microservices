import { OrderStatus } from "@trensetickets/packages/types";
import { BadRequestError } from "@trensetickets/packages/errors";
import { RequestHandler } from "express";
import Stripe from "stripe";
import { config } from "../constants";
import { PaymentCompletedPublisher } from "../events/publishers";
import { Order } from "../models/order";
import { Payment } from "../models/payment";
import { natsWrapper } from "../natsWrapper";
import { stripe } from "../stripe";

export const stripeWebhook: RequestHandler = async (req, res) => {
  const header = req.headers["stripe-signature"];

  console.log("header =>", header);

  if (!header) {
    throw new BadRequestError("Stripe signature header not present");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, header, config.stripeWebhookSecret);
  } catch (err: any) {
    console.log("stripe constructEvent message =>", err.message);
    throw new BadRequestError(err.message);
  }

  console.log("webhook event type =>", event.type);

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    console.log("inside payment intent succeeded");

    const orderId = intent.metadata.orderId;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new BadRequestError(`Order not found for id ${orderId}`);
    }

    const payment = await Payment.findOne({ stripeId: intent.id });

    if (!payment) {
      throw new BadRequestError(`Payment not found for stripe intent id ${intent.id}`);
    }

    new PaymentCompletedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });
  }

  res.sendStatus(200);
};

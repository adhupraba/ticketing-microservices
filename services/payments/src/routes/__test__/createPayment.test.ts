import { OrderStatus } from "@trensetickets/packages";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

it("returns a 404 when purchasing an order that does not exist", async () => {
  await global.createPayment(global.getMongoId()).expect(404);
});

it("returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = Order.build({
    id: global.getMongoId(),
    price: 10,
    status: OrderStatus.Created,
    userId: global.getMongoId(),
    version: 0,
  });
  await order.save();

  await global.createPayment(order.id).expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = global.getMongoId();
  const cookie = global.signin(userId);

  const order = Order.build({
    id: global.getMongoId(),
    price: 10,
    status: OrderStatus.Cancelled,
    userId,
    version: 0,
  });
  await order.save();

  await global.createPayment(order.id, cookie).expect(400);
});

it("returns a 204 with valid inputs", async () => {
  const userId = global.getMongoId();
  const cookie = global.signin(userId);
  const price = Math.floor(Math.random() * 100000);

  const order = Order.build({
    id: global.getMongoId(),
    price,
    status: OrderStatus.Created,
    userId,
    version: 0,
  });
  await order.save();

  await global.createPayment(order.id, cookie).expect(201);

  const paymentIntents = await stripe.paymentIntents.list({ limit: 50 });
  const paymentIntent = paymentIntents.data.find((intent) => intent.amount === price * 100);

  expect(paymentIntent).toBeDefined();
  expect(paymentIntent?.currency).toEqual("INR");

  const payment = await Payment.findOne({ orderId: order.id, stripeId: paymentIntent?.id });

  expect(payment).not.toBeNull();
});

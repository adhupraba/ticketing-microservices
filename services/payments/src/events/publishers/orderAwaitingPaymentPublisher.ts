import { OrderAwaitingPaymentEvent, Publisher, Subjects } from "@trensetickets/packages/pubsub";

export class OrderAwaitingPaymentPublisher extends Publisher<OrderAwaitingPaymentEvent> {
  readonly subject = Subjects.OrderAwaitingPayment;
}

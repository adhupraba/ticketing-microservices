import { OrderCancelledEvent, Publisher, Subjects } from "@trensetickets/packages/pubsub";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}

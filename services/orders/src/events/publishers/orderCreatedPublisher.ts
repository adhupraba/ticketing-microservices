import { OrderCreatedEvent, Publisher, Subjects } from "@trensetickets/packages/pubsub";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}

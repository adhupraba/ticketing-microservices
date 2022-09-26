import { OrderUpdatedEvent, Publisher, Subjects } from "@trensetickets/packages/pubsub";

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
  readonly subject = Subjects.OrderUpdated;
}

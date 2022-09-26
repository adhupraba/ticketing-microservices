import { PaymentCreatedEvent, Publisher, Subjects } from "@trensetickets/packages/pubsub";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}

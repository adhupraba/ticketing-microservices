import { Publisher, PaymentCompletedEvent, Subjects } from "@trensetickets/packages/pubsub";

export class PaymentCompletedPublisher extends Publisher<PaymentCompletedEvent> {
  readonly subject = Subjects.PaymentCompleted;
}

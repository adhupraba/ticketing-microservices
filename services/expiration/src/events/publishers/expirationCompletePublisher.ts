import { ExpirationCompleteEvent, Publisher, Subjects } from "@trensetickets/packages/pubsub";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}

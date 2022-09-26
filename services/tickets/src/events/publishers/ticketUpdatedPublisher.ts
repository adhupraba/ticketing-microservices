import { Publisher, Subjects, TicketUpdatedEvent } from "@trensetickets/packages/pubsub";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}

import { Publisher, Subjects, TicketCreatedEvent } from "@trensetickets/packages/pubsub";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

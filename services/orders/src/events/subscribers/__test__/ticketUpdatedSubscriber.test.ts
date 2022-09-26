import { TicketUpdatedEvent } from "@trensetickets/packages/pubsub";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { TicketUpdatedSubscriber } from "../ticketUpdatedSubscriber";

const setup = async () => {
  // CREATE AN INSTANCE OF THE SUBSCRIBER
  const subscriber = new TicketUpdatedSubscriber(natsWrapper.client);

  // CREATE AND SAVE A TICKET
  const ticket = Ticket.build({
    id: global.getMongoId(),
    price: 10,
    title: "arrow",
  });
  await ticket.save();

  // CREATE A FAKE DATA EVENT
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    price: 12,
    title: "peter england",
    userId: global.getMongoId(),
  };

  // CREATE A FAKE MESSAGE OBJECT
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg, ticket };
};

it("finds, updates and saves a ticket", async () => {
  const { subscriber, data, msg, ticket } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  // WRITE ASSERTIONS TO MAKE SURE A TICKET WAS CREATED
  const updTicket = await Ticket.findById(ticket.id);

  expect(updTicket).toBeDefined();
  expect(updTicket!.title).toEqual(data.title);
  expect(updTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { subscriber, data, msg } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  // WRITE ASSERTIONS TO MAKE SURE A ack FUNCTION WAS CALLED
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { subscriber, data, msg, ticket } = await setup();

  data.version = 10;

  try {
    await subscriber.onMessage(data, msg);
  } catch (err: any) {}

  expect(msg.ack).not.toHaveBeenCalled();
});

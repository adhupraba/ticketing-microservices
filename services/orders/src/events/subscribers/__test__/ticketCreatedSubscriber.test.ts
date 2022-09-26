import { TicketCreatedEvent } from "@trensetickets/packages";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../natsWrapper";
import { TicketCreatedSubscriber } from "../ticketCreatedSubscriber";

const setup = async () => {
  // CREATE AN INSTANCE OF THE SUBSCRIBER
  const subscriber = new TicketCreatedSubscriber(natsWrapper.client);

  // CREATE A FAKE DATA EVENT
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: global.getMongoId(),
    price: 12,
    title: "concert",
    userId: global.getMongoId(),
  };

  // CREATE A FAKE MESSAGE OBJECT
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { subscriber, data, msg };
};

it("creates and saves a ticket", async () => {
  const { subscriber, data, msg } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  // WRITE ASSERTIONS TO MAKE SURE A TICKET WAS CREATED
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { subscriber, data, msg } = await setup();

  // CALL THE onMessage FUNCTION WITH THE DATA OBJECT + MESSAGE OBJECT
  await subscriber.onMessage(data, msg);

  // WRITE ASSERTIONS TO MAKE SURE A ack FUNCTION WAS CALLED
  expect(msg.ack).toHaveBeenCalled();
});

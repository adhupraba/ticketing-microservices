import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // CREATE AN INSTANCE OF A TICKET
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });

  // SAVE THE TICKET TO THE DATABASE
  await ticket.save();

  // FETCH THE TICKET TWICE
  const t1 = await Ticket.findById(ticket.id);
  const t2 = await Ticket.findById(ticket.id);

  // MAKE TWO SEPARATE CHANGES TO THE TICKETS WE FETCHED
  t1!.set({ price: 10 });
  t2!.set({ price: 15 });

  // SAVE THE FIRST FETCHED TICKET
  await t1!.save();

  // SAVE THE SECOND FETCHED TICKET AND EXPECT AN ERROR
  try {
    await t2!.save();
  } catch (err: any) {
    return;
  }

  throw new Error("Should not have reached this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});

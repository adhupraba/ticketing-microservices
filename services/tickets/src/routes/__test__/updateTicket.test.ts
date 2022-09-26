import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../natsWrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await global.updateTicket(id, "Sdasfadfas", 123).expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${id}`).send({ title: "sfdhsgaf", price: 12 }).expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const newTicket = await global.createTicket("llkdhsf", 40);
  await global.updateTicket(newTicket.body.id, "popop", 50).expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await global.updateTicket(id, "", 12).expect(400);
  await global.updateTicket(id, "hdfhagadfa", -12).expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();
  const newTicket = await global.createTicket("mnbvcx", 20, cookie);

  const title = "zxcvb";
  const price = 100;

  const upd = await global.updateTicket(newTicket.body.id, title, price, cookie).expect(200);

  expect(upd.body.title).toEqual(title);
  expect(upd.body.price).toEqual(price);
});

it("publishes an event", async () => {
  const cookie = global.signin();

  const newTicket = await global.createTicket("mnbvcx", 20, cookie);

  const title = "zxcvb";
  const price = 100;

  await global.updateTicket(newTicket.body.id, title, price, cookie).expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin();

  const newTicket = await global.createTicket("mnbvcx", 20, cookie);

  const ticket = await Ticket.findById(newTicket.body.id);
  ticket?.set({ orderId: global.getMongoId() });
  await ticket?.save();

  const title = "zxcvb";
  const price = 100;

  await global.updateTicket(newTicket.body.id, title, price, cookie).expect(400);
});

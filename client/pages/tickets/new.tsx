import ErrorList from "@src/components/ErrorList";
import { webEnv } from "@src/constants/web";
import { useRequest } from "@src/hooks";
import { numInputValidator } from "@src/utils";
import { NextPage } from "next";
import Router from "next/router";
import { FormEvent, useState } from "react";

interface INewTicketProps {}

const NewTicket: NextPage<INewTicketProps> = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const { sendRequest, errors } = useRequest({
    url: `${webEnv.baseUrl}/api/tickets`,
    method: "post",
    body: { title, price },
    onSuccess: () => Router.push("/"),
  });

  const onBlur = () => {
    const value = parseFloat(price);

    if (isNaN(value)) {
      return;
    }

    setPrice(value.toFixed(2));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendRequest();
  };

  return (
    <form className="py-5" onSubmit={onSubmit}>
      <h1 className="mb-3">Create a Ticket</h1>
      <div className="form-group mb-3">
        <label className="form-label">Title</label>
        <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-group mb-3">
        <label className="form-label">Price</label>
        <input
          type="number"
          className="form-control"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={numInputValidator}
          onBlur={onBlur}
        />
      </div>

      {!!errors.length && <ErrorList errors={errors} />}

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default NewTicket;

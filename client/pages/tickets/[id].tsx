import ErrorList from "@src/components/ErrorList";
import { webEnv } from "@src/constants/web";
import { useRequest } from "@src/hooks";
import { ErrorField, ITicket } from "@src/types";
import { axiosCli } from "@src/utils";
import { GetServerSideProps, NextPage } from "next";
import Router from "next/router";
import { Fragment } from "react";

interface IShowTicketProps {
  ticket?: ITicket;
  ticketErrors?: ErrorField[];
}

const ShowTicket: NextPage<IShowTicketProps> = ({ ticket, ticketErrors }) => {
  const { sendRequest, errors } = useRequest({
    url: `${webEnv.baseUrl}/api/orders`,
    method: "post",
    body: { ticketId: ticket?.id },
    onSuccess: (order) => Router.push("/orders/[id]", `/orders/${order.id}`),
  });

  return (
    <div className="py-5">
      {!!ticketErrors?.length ? (
        <ErrorList errors={ticketErrors} />
      ) : (
        <Fragment>
          <h1 className="mb-3">{ticket?.title}</h1>
          <h4 className="mb-3">Price: {ticket?.price}</h4>
          {!!errors.length && <ErrorList errors={errors} />}
          <button className="btn btn-primary" onClick={sendRequest}>
            Purchase
          </button>
        </Fragment>
      )}
    </div>
  );
};

export default ShowTicket;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { id } = ctx.query;
    const { data } = await axiosCli({ req: ctx.req }).get(`/api/tickets/${id}`);

    return {
      props: {
        ticket: data,
      },
    };
  } catch (err: any) {
    const errors = err?.response?.data?.errors || [{ message: err.message }];

    return {
      props: { ticketErrors: errors },
    };
  }
};

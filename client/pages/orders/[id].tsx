import ErrorList from "@src/components/ErrorList";
import { webEnv } from "@src/constants/web";
import { useRequest } from "@src/hooks";
import { ErrorField, ICurrentUserProps, IOrder } from "@src/types";
import { axiosCli } from "@src/utils";
import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState, useRef, Fragment } from "react";
import CheckoutForm from "@src/components/CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

interface IShowOrderProps extends ICurrentUserProps {
  order?: IOrder;
  orderErrors?: ErrorField[];
}

const stripePromise = loadStripe(webEnv.stripeKey);

const ShowOrder: NextPage<IShowOrderProps> = ({ order, orderErrors, currentUser }) => {
  const isOrderPayable = order?.status === "created" || order?.status === "awaitingPayment";
  const isOrderPaid = order?.status === "complete";

  const [timeLeft, setTimeLeft] = useState(0);
  const [clientSecret, setClientSecret] = useState("");

  const intervalRef = useRef<NodeJS.Timer>();

  const { sendRequest, errors } = useRequest({
    url: `${webEnv.baseUrl}/api/payments`,
    method: "post",
    body: { orderId: order?.id },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
  });

  const findTimeLeft = () => {
    if (order?.expiresAt) {
      const secondsLeft = Math.round((new Date(order.expiresAt).getTime() - new Date().getTime()) / 1000);
      setTimeLeft(secondsLeft);
    } else {
      setTimeLeft(0);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    findTimeLeft();
    intervalRef.current = setInterval(findTimeLeft, 1000);

    isOrderPayable && sendRequest();

    return () => {
      stopTimer();
    };
  }, []);

  if (timeLeft <= 0) {
    stopTimer();

    return (
      <div>
        <h1>Order expired</h1>
      </div>
    );
  }

  return (
    <div className="py-5">
      {!!orderErrors?.length ? (
        <ErrorList errors={orderErrors} />
      ) : (
        <Fragment>
          {isOrderPayable && (
            <Fragment>
              <h1 className="mb-3">Purchasing: {order.ticket.title}</h1>
              <h4 className="mb-3">Price: {order.ticket.price}</h4>
              <h4 className="mb-4">Time left to pay: {timeLeft} seconds</h4>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm />
                </Elements>
              ) : (
                <div>Loading payment fields...</div>
              )}
            </Fragment>
          )}

          {isOrderPaid && (
            <Fragment>
              <h1 className="mb-3">Purchased: {order.ticket.title}</h1>
              <h4 className="mb-3">Price: {order.ticket.price}</h4>
            </Fragment>
          )}

          {!!errors.length && <ErrorList errors={errors} />}
        </Fragment>
      )}
    </div>
  );
};

export default ShowOrder;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { id } = ctx.query;
    const { data } = await axiosCli({ req: ctx.req }).get(`/api/orders/${id}`);

    return {
      props: {
        order: data,
      },
    };
  } catch (err: any) {
    const errors = err?.response?.data?.errors || [{ message: err.message }];

    return {
      props: { orderErrors: errors },
    };
  }
};

import ErrorList from "@src/components/ErrorList";
import { ErrorField, ICurrentUserProps, IOrder } from "@src/types";
import { axiosCli } from "@src/utils";
import { GetServerSideProps, NextPage } from "next";

interface IOrderProps extends ICurrentUserProps {
  orders?: IOrder[];
  ordersErrors?: ErrorField[];
}

const Orders: NextPage<IOrderProps> = ({ orders, ordersErrors }) => {
  return (
    <div>
      <h1>My Orders</h1>

      {!!ordersErrors?.length && <ErrorList errors={ordersErrors} />}

      {!!orders?.length && (
        <ul>
          {orders.map((order, idx) => (
            <li key={idx}>
              {order.ticket.title} - Rs. {order.ticket.price} -{" "}
              <span
                className={
                  order.status === "complete" ? "text-success" : order.status === "cancelled" ? "text-danger" : ""
                }
              >
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { data } = await axiosCli({ req: ctx.req }).get("/api/orders");

    return {
      props: {
        orders: data,
      },
    };
  } catch (err: any) {
    const errors = err?.response?.data?.errors || [{ message: err.message }];

    return {
      props: {
        ordersErrors: errors,
      },
    };
  }
};

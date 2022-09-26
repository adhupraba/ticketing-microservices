import type { GetServerSideProps, NextPage } from "next";
import { ICurrentUserProps, ITicket } from "@src/types";
import { axiosCli } from "@src/utils";
import Link from "next/link";

interface IHomeProps extends ICurrentUserProps {
  tickets: ITicket[];
}

const Home: NextPage<IHomeProps> = ({ currentUser, tickets }) => {
  return (
    <div className="pt-5">
      <h1 className="mb-3">Tickets</h1>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody className="table-striped">
          {tickets.map((ticket, idx) => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.price}</td>
              <td>
                <Link href="/tickets/[id]" as={`/tickets/${ticket.id}`}>
                  <a>View</a>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const { data } = await axiosCli({ req }).get("/api/tickets");

    return {
      props: { tickets: data },
    };
  } catch (err: any) {
    const errors = err?.response?.data?.errors || [{ message: err.message }];
    console.error("ERROR SERVER SIDE PROPS landing page", errors);

    return {
      props: { errors },
    };
  }
};

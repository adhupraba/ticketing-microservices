import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.css";
import { axiosCli } from "@src/utils";
import { CurrentUser, ErrorField, Maybe } from "@src/types";
import Header from "@src/components/Header";
import { globalStore } from "@src/store";

type CustomAppProps = AppProps & {
  currentUser: Maybe<CurrentUser>;
  errors: Maybe<ErrorField[]>;
};

const MyApp = ({ Component, pageProps, currentUser, errors }: CustomAppProps) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default MyApp;

MyApp.getInitialProps = async (appCtx: any) => {
  const req = appCtx.ctx.req;

  try {
    const { data } = await axiosCli({ req }).get("/api/users/currentUser");

    console.log("getServerSideProps app currentUser ===>", data);
    globalStore.set("currentUser", data.currentUser);

    return {
      pageProps: {},
      currentUser: data.currentUser,
    };
  } catch (err: any) {
    const errors = err?.response?.data?.errors || [{ message: err.message }];
    console.error("ERROR SERVER SIDE PROPS app", errors);

    return {
      pageProps: {
        pageProps: {},
        currentUser: null,
        errors,
      },
    };
  }
};

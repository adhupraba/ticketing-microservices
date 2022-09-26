import { webEnv } from "@src/constants/web";
import { useRequest } from "@src/hooks";
import { NextPage } from "next";
import Router from "next/router";
import { useEffect } from "react";

interface ISignoutProps {}

const Signout: NextPage<ISignoutProps> = () => {
  const { sendRequest, errors } = useRequest({
    url: `${webEnv.baseUrl}/api/users/signout`,
    method: "post",
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    sendRequest();
  }, []);

  return <div>Signing you out...</div>;
};

export default Signout;

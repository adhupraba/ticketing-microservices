import { commonVars } from "@src/constants/common";
import { serverEnv } from "@src/constants/server";
import { webEnv } from "@src/constants/web";
import axios from "axios";
import { IncomingMessage } from "http";

type Req = IncomingMessage & {
  cookies: Partial<{
    [key: string]: string;
  }>;
};

type AxiosCliParams = {
  req?: Req;
};

export const axiosCli = ({ req }: AxiosCliParams = {}) => {
  if (typeof window === "undefined" && commonVars.env === "server" && req?.headers) {
    // we are on server
    return axios.create({
      baseURL: serverEnv.ingressUrl,
      headers: req.headers as any,
      withCredentials: true,
    });
  } else {
    // we are on browser
    return axios.create({
      baseURL: webEnv.baseUrl,
      withCredentials: true,
    });
  }
};

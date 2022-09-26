const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
const { ports, isAuthUrl, isTicketUrl, isOrdersUrl, isPaymentsUrl } = require("./constants");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const constructUrl = (req) => {
  let url = "";
  const ogUrl = req.originalUrl;
  const params = req.params["0"];
  const base = "http://localhost";

  if (isAuthUrl(ogUrl)) {
    url = `${base}:${ports.auth}/${params}`;
  } else if (isTicketUrl(ogUrl)) {
    url = `${base}:${ports.tickets}/${params}`;
  } else if (isOrdersUrl(ogUrl)) {
    url = `${base}:${ports.orders}/${params}`;
  } else if (isPaymentsUrl(ogUrl)) {
    url = `${base}:${ports.payments}/${params}`;
  }

  return url;
};

const callService = async (req, res) => {
  try {
    const url = constructUrl(req);

    // console.log("callService headers =====>", req.headers);

    // console.log("#####################################################################");

    let data, status, headers;
    const method = req.method.toLowerCase();
    const opts = {
      headers: req.headers.cookie ? { Cookie: req.headers.cookie } : undefined,
      withCredentials: true,
    };

    // console.log("opts =====>", opts);

    if (method === "get") {
      ({ data, status, headers } = await axios[method](url, opts));
    } else {
      console.log("making the request to url =>", url);
      ({ data, status, headers } = await axios[method](url, req.body, opts));
      console.log("res fetched");
    }

    // console.log("response headers =======>", headers);

    if (headers["set-cookie"]) {
      res.setHeader("Set-Cookie", headers["set-cookie"]);
    }

    return res.status(status).send(data);
  } catch (err) {
    // console.log("err ====>", err);
    console.log("error message ======>", err.message);
    console.log("error data =====>", err.response?.data);

    const status = err.response?.status || 400;
    const errors = err.response?.data || { errors: [{ message: "Something went wrong" }] };

    return res.status(status).send(errors);
  }
};

app.all("/gateway/*", callService);

app.listen(9000, () => {
  console.log("gateway service running on port 9000");
});

import { NextPage } from "next";
import { FormEvent, useState } from "react";
import { webEnv } from "@src/constants/web";
import ErrorList from "@src/components/ErrorList";
import { useRequest } from "@src/hooks";
import Router from "next/router";

interface ISigninProps {}

const Signin: NextPage<ISigninProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { sendRequest, errors } = useRequest({
    url: `${webEnv.baseUrl}/api/users/signin`,
    method: "post",
    body: { email, password },
    onSuccess: (data) => {
      console.log({ data });
      Router.push("/");
    },
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendRequest();
  };

  return (
    <form className="py-5" onSubmit={onSubmit}>
      <h1 className="mb-3">Signin</h1>
      <div className="form-group mb-3">
        <label className="form-label">Email</label>
        <input type="text" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {!!errors.length && <ErrorList errors={errors} />}

      <button type="submit" className="btn btn-primary">
        Sign In
      </button>
    </form>
  );
};

export default Signin;

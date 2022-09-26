export const checkServerEnv = () => {
  let missing: string[] = [];

  for (let key of Object.keys(serverEnv)) {
    if (serverEnv[key as keyof typeof serverEnv] === "") {
      missing.push(key);
    }
  }

  if (missing.length) {
    throw new Error(`Please define ${missing.join(", ")} env variables in server`);
  }
};

export const serverEnv = {
  nodeEnv: process.env.NODE_ENV || "",
  // to call the ingress nginx from a service, the url would like below:
  // ? <ingress-svc>.<ingress-namespace>.svc.cluster.local
  ingressUrl: process.env.INGRESS_URL,
};

let checked = false;

if (!checked) {
  console.log("checking all server env if present");
  checkServerEnv();
  console.log("server env verified");
  checked = true;
}

export const serverVars = {
  isProd: serverEnv.nodeEnv === "production",
};

export const checkWebEnv = () => {
  let missing: string[] = [];

  for (let key of Object.keys(webEnv)) {
    if (webEnv[key as keyof typeof webEnv] === "") {
      missing.push(key);
    }
  }

  if (missing.length) {
    throw new Error(`Please define ${missing.join(", ")} env variables in web`);
  }
};

export const webEnv = {
  nodeEnv: process.env.NEXT_PUBLIC_NODE_ENV || "",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
  stripeKey: process.env.NEXT_PUBLIC_STRIPE_KEY || "",
};

let checked = false;

if (!checked) {
  console.log("checking all web env if present");
  checkWebEnv();
  console.log("web env verified");
  checked = true;
}

export const webVars = {
  isProd: webEnv.nodeEnv === "production",
};

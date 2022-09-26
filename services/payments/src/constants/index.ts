import { randomBytes } from "crypto";
import dotenv from "dotenv";
import path from "path";

const isProdPreCheck = process.env.NODE_ENV === "production";
!isProdPreCheck && dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

export const checkEnv = () => {
  let error = false;

  for (let key of Object.keys(config)) {
    if (config[key as keyof typeof config] === "") {
      error = true;
      console.error(`Please define ${key} env variable`);
    }
  }

  if (error) {
    process.exit(1);
  }
};

const getEnv = (key: string, fallback?: string) => {
  return process.env[key] || fallback || "";
};

export const config = {
  nodeEnv: getEnv("NODE_ENV"),
  mongoUrl: getEnv("MONGO_URL"),
  jwtSecret: getEnv("JWT_SECRET"),
  stripeSecret: getEnv("STRIPE_SECRET"),
  stripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET"),
  natsClusterId: getEnv("NATS_CLUSTER_ID"),
  natsClientId: getEnv("NATS_CLIENT_ID", randomBytes(4).toString("hex")),
  natsUrl: getEnv("NATS_URL"),
};

export const vars = {
  isProd: config.nodeEnv === "production",
};

export const events = {
  queueGroupName: "paymentsService",
};

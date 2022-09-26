import { randomBytes, scryptSync } from "crypto";

export class Hash {
  static toHash(data: string) {
    const salt = randomBytes(8).toString("hex");
    const hashed = scryptSync(data, salt, 64);
    return `${hashed.toString("hex")}.${salt}`;
  }

  static compare(hashedData: string, unHashedData: string) {
    const [hashedStr, salt] = hashedData.split(".");
    const newHash = scryptSync(unHashedData, salt, 64);

    return newHash.toString("hex") === hashedStr;
  }
}

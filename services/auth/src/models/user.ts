import { Schema, model, Model, Document } from "mongoose";
import { Hash } from "../utils/hash";

// properties that are required to create a new user
export interface IUser {
  email: string;
  password: string;
}

// combining properties to model a document interface
interface UserDoc extends IUser, Document {
  createdAt?: boolean | string;
  updatedAt?: boolean | string;
}

// properties that a user model has
interface UserModel extends Model<UserDoc> {
  build(attrs: IUser): UserDoc;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    // while converting to json, the user model uses this configuration
    // to output json that matches to the definition given here
    toJSON: {
      versionKey: false,
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

userSchema.statics.build = (attrs: IUser) => {
  return new User(attrs);
};

userSchema.pre("save", function (next, opts) {
  if (this.isModified("password")) {
    const hashed = Hash.toHash(this.get("password"));
    this.set("password", hashed);
  }

  next();
});

export const User = model<UserDoc, UserModel>("User", userSchema);

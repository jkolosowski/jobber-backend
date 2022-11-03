import { Schema, model } from "../config/mongo";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({});

export const usernameField = "email";
userSchema.plugin(passportLocalMongoose, {
  usernameField,
});
userSchema.path(usernameField);

export default model("User", userSchema);

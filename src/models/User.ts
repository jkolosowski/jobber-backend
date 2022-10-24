import { Schema, model } from "../config/mongo";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new Schema({});

const usernameField = "username";
userSchema.plugin(passportLocalMongoose, {
  usernameField
});
userSchema.path(usernameField);

export default model("User", userSchema);

import passportLocalMongoose from "passport-local-mongoose";

import { UserDocument } from "../interfaces/userDocument";
import { Schema, model } from "../config/mongo";

const userSchema = new Schema<UserDocument>({
  accountType: {
    type: String,
    enum: ["Candidate", "Recruiter"],
    default: "Candidate",
  },
});

export const usernameField = "email";
userSchema.plugin(passportLocalMongoose, {
  usernameField,
});
userSchema.path(usernameField);

export default model<UserDocument>("User", userSchema);

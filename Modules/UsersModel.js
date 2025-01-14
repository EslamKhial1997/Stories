const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: String,
  username: String,
  phone: String,
  image: String,
  nickname: String,
  country: String,
  block: {
    type: Boolean,
    default: false,
  }, 
  favorite: {
    type: Boolean,
    default: false,
  },
  hisProfileComplete: {
    type: Boolean,
    default: false,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  birthday: String,
},{ timestamps: true });
const ImageURL = (doc) => {
  if (doc.image && !doc.image.includes(`${process.env.BASE_URL}/user`)) {
    const image = `${process.env.BASE_URL}/user/${doc.image}`;
    doc.image = image;
  }
};
userSchema.post("init", (doc) => {
  ImageURL(doc);
});
userSchema.post("save", (doc) => {
  ImageURL(doc);
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;

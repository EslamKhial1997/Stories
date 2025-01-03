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
  grander: {
    type: String,
    enum: ["male", "female"],
    default: "male",
  },
  birthday: String,
});
const ImageURL = (doc) => {
  if (doc.image && !doc.image.includes(`${process.env.BASE_URL}/teacher`)) {
    const image = `${process.env.BASE_URL}/teacher/${doc.image}`;
    doc.image = image;
  }
};
createTeachers.post("init", (doc) => {
  ImageURL(doc);
});
createTeachers.post("save", (doc) => {
  ImageURL(doc);
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;

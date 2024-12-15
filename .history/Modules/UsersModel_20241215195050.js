const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firebaseUID: { type: String, required: true, unique: true },
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
  if (doc.image && !doc.image.includes(`${process.env.BASE_URL}/gallery`)) {
    const image = `${process.env.BASE_URL}/gallery/${doc.image}`;
    doc.image = image;
  }
};
createGallery.post("init", (doc) => {
  ImageURL(doc);
});
createGallery.post("save", (doc) => {
  ImageURL(doc);
});
const UsersModel = mongoose.model("Users", userSchema);
module.exports = UsersModel;

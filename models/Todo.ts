import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  title: String,
  text: String,
});

mongoose.model("Todo", todoSchema);

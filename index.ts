import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";

const PORT = process.env.PORT || 5000;
mongoose.connect(
  "mongodb+srv://FraterSKS:fiZD5oGbGI5QgKkb@cluster0.uxhal5c.mongodb.net/todotwo?retryWrites=true&w=majority"
);
require("./models/Todo");
const Todo = mongoose.model("Todo");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json("Home");
});

app.get("/api", async (req, res) => {
  const data = await Todo.find({});

  res.json(data);
});

app.post("/api", async (req, res) => {
  try {
    const newTodo = new Todo(req.body);
    const saved = await newTodo.save();
    res.json(saved);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.put("/api", async (req, res) => {
  const id = req.body.id;
  try {
    const sent = await Todo.findByIdAndUpdate(id, {
      title: req.body.title,
      text: req.body.text,
    });
    res.json(sent);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.delete("/api/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Todo.findByIdAndDelete(id);
    res.json(deleted);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.post("/login", (req, res) => {
  console.log(req.body);
  res.json("sent");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

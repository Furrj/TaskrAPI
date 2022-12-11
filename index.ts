import express, { Express, Request, Response } from "express";
import mongoose, { Model } from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";

const PORT = process.env.PORT || 5000;

//MONGOOSE
mongoose.connect(
  "mongodb+srv://FraterSKS:fiZD5oGbGI5QgKkb@cluster0.uxhal5c.mongodb.net/todotwo?retryWrites=true&w=majority"
);
import { ITodo } from "./models/Todo";
require("./models/Todo");
const Todo: Model<ITodo> = mongoose.model<ITodo>("Todo");
import { IUser } from "./models/User";
require("./models/User");
const User: Model<IUser> = mongoose.model<IUser>("User");

const app = express();

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(cors());
app.use(express.json());

//TS
//TYPES
type userInfo = {
  username: string;
  password: string;
};

type userSend = {
  username: string;
  id: string;
  valid: boolean;
};

//ROUTES
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "..", "build", "index.html"));
// });

//TODO DATA
app.put("/api", async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.findById(id).populate("todos");

    if (user) {
      res.json(user.todos);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.post("/api/newTodo", async (req, res) => {
  const { title, text, due, completed, user } = req.body;
  try {
    const newTodo = new Todo({ title, text, due, completed });
    const saved = await newTodo.save();
    const foundUser: any = await User.findById(user);
    foundUser.todos.push(newTodo);
    await foundUser.save();
    res.json(saved);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.put("/api/newTodo", async (req, res) => {
  const id = req.body.id;
  try {
    const sent = await Todo.findByIdAndUpdate(id, {
      title: req.body.title,
      text: req.body.text,
      due: req.body.due,
    });
    res.json(sent);
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

app.put("/api/delete", async (req, res) => {
  const { todoID, userID } = req.body;
  try {
    const deleted = await Todo.findByIdAndDelete(todoID);
    const user = await User.findById(userID);
    if (user) {
      await user.updateOne({ $pull: { todos: todoID } });
      await user.save();
    }
    res.json(deleted);
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

//USER DATA
app.post(
  "/register",
  async (req, res): Promise<Response<any, Record<string, any>>> => {
    const { username, password }: userInfo = req.body;
    const invalidUser: userSend = { username: "", id: "", valid: false };

    //CHECK IF USERNAME ALREADY EXISTS
    const userQuery: Model<IUser> | any = await User.findOne({ username });
    if (userQuery) {
      return res.json(invalidUser);
    }

    //ENCRYPT PASSWORD
    const hash: string = await bcrypt.hash(password, 12);

    //CREATE AND SAVE NEW USER
    const newUser = new User({
      username,
      password: hash,
    });

    await newUser.save();

    return res.json({
      username: newUser.username,
      id: newUser._id,
      valid: true,
    });
  }
);

app.post(
  "/login",
  async (req, res): Promise<Response<any, Record<string, any>>> => {
    const { username, password }: userInfo = req.body;
    const invalidUser: userSend = { username: "", id: "", valid: false };

    const userQuery: Model<IUser> | any = await User.findOne({ username });
    if (!userQuery) {
      return res.json(invalidUser);
    }

    const checkPassword: boolean = await bcrypt.compare(
      password,
      userQuery.password
    );
    if (checkPassword) {
      return res.json({
        username: userQuery.username,
        id: userQuery._id,
        valid: true,
      });
    } else {
      return res.json(invalidUser);
    }
  }
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

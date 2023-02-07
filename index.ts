import express, { Express, Request, Response } from "express";
import mongoose, { Model } from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcrypt";
import session from "express-session";
import cookieParser from "cookie-parser";

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
app.use(cookieParser());
declare module "express-session" {
  interface SessionData {
    currentUser: userSend;
  }
}
app.use(
  session({
    secret: "ABCDEFG",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 15,
    },
  })
);

//TS
type userInfo = {
  username: string;
  password: string;
};

type userSend = {
  username: string;
  id: string;
  valid: boolean;
};

const invalidUser: userSend = {
  username: "",
  id: "",
  valid: false,
};

//GET USER TODOS
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

//SUBMIT NEW TODO
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

//UPDATE EXISTING TODO
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

//DELETE TODO
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

//MARK TODO AS COMPLETE
app.put("/api/markComplete", async (req, res) => {
  const { id } = req.body;

  try {
    const foundTodo = await Todo.findById(id);
    if (foundTodo) {
      foundTodo.completed = true;
      const savedTodo = await foundTodo.save();
      res.json(savedTodo);
    }
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json(`Error: ${e}`);
  }
});

//VALIDATE USER SESSION
app.get("/api/validate", async (req, res) => {
  if (req.session.currentUser) {
    if (req.session.currentUser.valid === true) {
      return res.json(req.session.currentUser);
    } else {
      return res.json(invalidUser);
    }
  } else {
    return res.json(invalidUser);
  }
});

//REGISTER USER
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

    req.session.currentUser = {
      username: newUser.username,
      id: newUser._id,
      valid: true,
    };

    return res.json(req.session.currentUser);
  }
);

//LOGIN USER
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
      req.session.currentUser = {
        username: userQuery.username,
        id: userQuery._id,
        valid: true,
      };
      return res.json(req.session.currentUser);
    } else {
      return res.json(invalidUser);
    }
  }
);

//LOGOUT USER
app.get("/logout", (req, res) => {
  req.session.currentUser = invalidUser;
  res.json("Logged out");
});

//SERVE HTML
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

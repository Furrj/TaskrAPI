import { Document, Schema, Model, model } from "mongoose";

export interface ITodo extends Document {
  title: string;
  text: string;
  due: string;
  completed: boolean;
}

const todoSchema = new Schema<ITodo>({
  title: String,
  text: String,
  due: String,
  completed: Boolean,
});

model<ITodo>("Todo", todoSchema);

export {};

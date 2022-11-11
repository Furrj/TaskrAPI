"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const PORT = process.env.PORT || 5000;
mongoose_1.default.connect("mongodb+srv://FraterSKS:fiZD5oGbGI5QgKkb@cluster0.uxhal5c.mongodb.net/todotwo?retryWrites=true&w=majority");
require("./models/Todo");
const Todo = mongoose_1.default.model("Todo");
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "build")));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "..", "build", "index.html"));
});
app.get("/api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield Todo.find({});
    res.json(data);
}));
app.post("/api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newTodo = new Todo(req.body);
        const saved = yield newTodo.save();
        res.json(saved);
    }
    catch (e) {
        console.log(`Error: ${e}`);
        res.json(`Error: ${e}`);
    }
}));
app.put("/api", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.id;
    try {
        const sent = yield Todo.findByIdAndUpdate(id, {
            title: req.body.title,
            text: req.body.text,
        });
        res.json(sent);
    }
    catch (e) {
        console.log(`Error: ${e}`);
        res.json(`Error: ${e}`);
    }
}));
app.delete("/api/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleted = yield Todo.findByIdAndDelete(id);
        res.json(deleted);
    }
    catch (e) {
        console.log(`Error: ${e}`);
        res.json(`Error: ${e}`);
    }
}));
app.post("/login", (req, res) => {
    console.log(req.body);
    res.json("sent");
});
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});

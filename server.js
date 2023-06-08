import express from "express";
import { createServer } from "https";
import { WebSocketServer } from "ws";

import { handler } from "./build/handler.js";

const port = process.env.PORT ?? 3001;
const app = express();
const server = createServer(app);

server.listen(port, () => {
    console.log("Running on port " + port);
});

app.get("/", (req, res) => res.send("Hello World!"));

const wss = new WebSocketServer({ server });
wss.on("connection", (socket) => {
    socket.send("Hello");
});
console.log("Debug");
app.use(handler);
server.listen(port);

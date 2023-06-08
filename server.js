import express from "express";
import { createServer } from "https";
import { WebSocketServer } from "ws";

import { handler } from "./build/handler.js";

const port = 443;
const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ server });
wss.on("connection", (socket) => {
    socket.emit("Hello");
});
console.log("haj");
app.use(handler);
server.listen(port);

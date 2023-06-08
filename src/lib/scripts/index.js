import express from "express";
import { createServer } from "https";
import { WebSocketServer } from "ws";

import { handler } from "../build/handler";

const port = 443;
const app = express();
const server = createServer(app);

const wss = new WebSocketServer({ port });
wss.on("connection", (socket) => {
    socket.emit("Hello");
});

app.use(handler);
server.listen(port);

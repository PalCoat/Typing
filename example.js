const plugin = {
    name: "plugin",
    configureServer(server) {
        // we can pass the server to Socket.io
        const io = new Server(server.httpServer);
        // ...
    },
};

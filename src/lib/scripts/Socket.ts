let socketInstance: WebSocket;

export function getSocket(location: string, port: string) {
    if (!socketInstance || socketInstance == undefined) {
        socketInstance = new WebSocket(
            "wss://typister.onrender.com" + ":" + port
        );
    }
    return socketInstance;
}

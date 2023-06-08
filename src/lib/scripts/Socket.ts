let socketInstance: WebSocket;

export function getSocket(location: string, port: string) {
    if (!socketInstance || socketInstance == undefined) {
        socketInstance = new WebSocket("ws://" + location + ":" + port);
    }
    return socketInstance;
}

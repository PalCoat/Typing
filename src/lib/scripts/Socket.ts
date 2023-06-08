let socketInstance: WebSocket;

export function getSocket(location: string) {
    if (!socketInstance || socketInstance == undefined) {
        socketInstance = new WebSocket("wss://" + location + ":" + "443");
    }
    return socketInstance;
}

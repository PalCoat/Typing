let socketInstance : WebSocket;

export function getSocket() {
  if (!socketInstance || socketInstance == undefined) {
    socketInstance = new WebSocket("ws://localhost:80");
  }
  return socketInstance;
}
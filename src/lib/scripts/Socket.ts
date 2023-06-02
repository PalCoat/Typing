let socketInstance : WebSocket;

export function getSocket(location: string) {
  if (!socketInstance || socketInstance == undefined) {
    socketInstance = new WebSocket("ws://" + location + ":81");
  }
  return socketInstance;
}

import socket from "socket.io";
import http from "http";

export default (http: http.Server) => 
{
    const io = socket(http);

    io.on("connection", function(socket: any) 
    {
        //фиксируем сигнализатор создания сообщений с клиент-приложения
        socket.on("DIALOGS:TYPING", (obj: any) => {
            socket.emit("DIALOGS:TYPING",obj);
        })
    });

    return io;
}
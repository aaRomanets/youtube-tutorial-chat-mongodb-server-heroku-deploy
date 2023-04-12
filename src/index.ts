import express from 'express';
const { cors } = require('cors-ts')
import dotenv from "dotenv";
import {createServer} from "http";

import "./core/db";
import createRoutes from "./core/routes";
import createSocket from "./core/socket";

const app = express();
//Parameters are Optional
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
)

const http = createServer(app);
const io = createSocket(http);

dotenv.config();
//создаем маршрутизаторы сервера
createRoutes(app,io);

//запускаем сервер
http.listen(process.env.PORT, function() {
    console.log(`Server: http://localhost:${process.env.PORT}`);
});
import bodyParser from "body-parser";
import express from "express";
import socket from "socket.io";
import {updateLastSeen, checkAuth} from '../middlewares';
import {loginValidation, registerValidation} from '../utils/validations';

import multer from "../core/multer";

import { 
    UserCtrl, 
    DialogCtrl, 
    MessageCtrl, 
    UploadFileCtrl
} from "../controllers";

const createRoutes = (app: express.Express, io: socket.Server) => 
{
    const UserController = new UserCtrl();
    const DialogController = new DialogCtrl(io);
    const MessageController = new MessageCtrl(io);
    const UploadFileController = new UploadFileCtrl();

    app.use(bodyParser.json());
    
    //проверка авторизации пользователя
    app.use(checkAuth);
    
    //меняем время просмотра пользователем сообщений
    app.use(updateLastSeen);
    
    //маршрутизатор получения информации об авторизованном пользователе
    app.get("/user/me", UserController.getMe);
    //маршрутизатор регистрации пользователя по электронной почте полному имени и паролю
    app.post("/user/signup", registerValidation, UserController.create);
    //маршрутизатор авторизации пользователя
    app.post("/user/signin",loginValidation, UserController.login);
    //маршрутизатор нахождения пользователей
    app.get("/user/find", UserController.findUsers);
    
    //маршрутизатор вывода всех диалогов
    app.get("/dialogs", DialogController.index);
    //маршрутизатор создания диалогов
    app.post("/dialogs", DialogController.create);
    
    //маршоутизатор получения полной информации о всех сообщениях в диалоге 
    app.get("/messages", MessageController.index);
    //маршрутизатор удаления выбранного сообщения в диалоге
    app.delete("/messages", MessageController.delete);
    //машрутизатор создания нового сообщения в диалоге
    app.post("/messages", MessageController.create); 
    
    //маршрутизатор загрузки файла
    app.post("/files", multer.single("file"), UploadFileController.create);
    //маршрутизатор удаления файла из базы данных, который загружается для составления очередного сообщения
    app.delete("/files", UploadFileController.delete);
}

export default createRoutes;
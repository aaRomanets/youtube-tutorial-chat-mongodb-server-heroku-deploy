import express from "express";
import socket from "socket.io";
import {DialogModel, MessageModel} from "../models";

class DialogController 
{
    io: socket.Server;
    constructor(io: socket.Server) 
    {
        this.io = io;
    }

    //функция вывода всех диалогов
    index = (req: express.Request, res: express.Response) => 
    { 
        //userId получаем из токена
        const userId = req.user._id;
   
        DialogModel.find().or([{ author: userId }, { partner: userId }])
            //получаем полную информацию о пользователе author
            //получаем полную информацию о пользователе partner
            .populate(["author","partner"])
            //получаем полную информацию о сообщении lastMessage
            .populate({
                path: "lastMessage",
                //получаем полную информацию о пользователе который написал сообщение lastMessage
                populate: {
                    path: "user"
                }
            })
            .exec(function(err,dialogs) 
            {
                if (err) 
                {
                    return res.status(404).json(
                    {
                        message: "Dialogs not found"
                    })
                }

                //выводим полученные диалоги
                return res.json(dialogs);
            })
    }

    //функция создания диалогов
    create = (req: express.Request, res: express.Response): void => 
    {
        //author диалога берется из токена
        //partner диалога берется из получаемых данных
        const postData = 
        {
            author: req.user._id,
            partner: req.body.partner
        }

        //создаем диалог в базе данных диалогов
        const dialog = new DialogModel(postData);

        dialog.save().then((dialogObj: any) => 
        {
            //формируем сообщение от user(author) к partner
            const message = new MessageModel(
            {
                text: req.body.text,
                user: req.user._id,
                dialog: dialogObj._id,
            })

            //фиксируем сформированное сообщение в базе данных сообщений
            message.save().then(() => 
            {
                dialogObj.lastMessage = message._id;
                dialogObj.save().then(() =>
                {
                    res.json(dialogObj);
                    //сигнал по сокету о создании нового диалога
                    this.io.emit("SERVER:DIALOG_CREATED",{});
                });
            })
            .catch(reason => 
            {
                res.json(reason);
            })
        })
        .catch(err => 
        {
            res.json
            ({
                status: "error",
                message: err
            });
        })
    }
}

export default DialogController;
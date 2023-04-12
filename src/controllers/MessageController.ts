import express from "express";
import socket from "socket.io";

import {MessageModel, DialogModel} from "../models";
import { IMessage } from "../models/Message";

class MessageController 
{
    io: socket.Server;

    constructor(io: socket.Server) 
    {
        this.io = io;
    }

    //функция фиксации прочитанных сообщений
    updateReadStatus = (res: express.Response, userId: string, dialogId: string): void => 
    {
        MessageModel.updateMany({dialog: dialogId, user: {$ne: userId}}, {$set: {readed: true}}, (err: any): void => 
        {
            if (err) 
            {
                res.status(500).json({status: "error", message: err});
            } 
        })
    }

    //функция получения полной информации о всех сообщениях в диалоге 
    index = (req: express.Request, res: express.Response): void => 
    {
        //получаем идентификатор диалога, информацию о всех сообщений которого будем собирать
        const dialogId: string = req.query.dialog as string;
        MessageModel.find({dialog: dialogId}).populate(["dialog", "user","attachments"]).exec(function(err,messages) 
        {    
            if (err) 
            {    
                return res.status(404).json(
                {
                    status: "error",
                    message: "Messages not found"
                })
            }
            return res.json(messages);
        })   
    }

    //функция создания нового сообщения в диалоге
    create = (req: express.Request, res: express.Response) => 
    {
        //идентификатор пользователя, который послал новое сообщение
        const userId: string = req.user._id;
        //данные о новом сообщении
        const postData = 
        {
            text: req.body.text,
            dialog: req.body.dialog_id,
            attachments: req.body.attachments,
            user: userId,
        };
        const message = new MessageModel(postData);
        //фиксируем прочитанные сообщения собеседником
        this.updateReadStatus(res, userId, req.body.dialog_id);
        //записываем новое сообщение в базу данных сообщений
        message.save().then((obj: IMessage) => 
        {
            obj.populate("dialog user attachments", (err: any, message: IMessage) => 
            {
                if (err) 
                {
                    return res.status(500).json(
                    {
                        status: "error",
                        message: err
                    })
                }
                //база данных диалогов изменяется в диалоге с идентификатором postData.dialog
                //появилось новое последнее сообщение с идентификатором message._id
                DialogModel.findOneAndUpdate({_id: postData.dialog},{lastMessage: message._id},{upsert: true},
                    function(err) 
                    {
                        if (err) 
                        {
                            return res.status(500).json(
                            {
                                status: "error",
                                message: err
                            });
                        }
                    }
                )
                res.json(message);
                //сокет-сервер, говорящий о том что принято новое сообщение
                this.io.emit("SERVER:NEW_MESSAGE",message);
            })
        })
        .catch(reason => 
        {
            res.json(reason);
        })
    }

    //функция удаления выбранного сообщения в диалоге
    delete = (req: express.Request, res: express.Response): void => 
    {
        //идентификатор удаляемого сообщения
        const messageDeleteId: string = req.query.id as string;
        MessageModel.findById(messageDeleteId, (err, message: any) => 
        {
            if (err || !message) 
            {
                return res.status(404).json
                ({
                    status: "error",
                    message: "Message not found",
                });
            }
            const dialogId = message.dialog;
            //удаляем выбранное сообщение
            message.remove();
            //обновляем последнее сообщение (оно может измениться)
            MessageModel.find({dialog: dialogId}).sort('createdAt').exec((err, messages) => 
            {
                if (err) 
                {
                    res.status(500).json
                    ({
                        status: "error",
                        message: err,
                    });
                }
                //в базе данных диалогов изменяем идентификатор последнего сообщения lastMessage в диалоге с идентификатором dialogId
                DialogModel.findById(dialogId, (err, dialog) => 
                {
                    if (err) 
                    {
                        res.status(500).json
                        ({
                            status: "error",
                            message: err,
                        });
                    }
    
                    if (!dialog) 
                    {
                        return res.status(404).json
                        ({
                            status: "not found",
                            message: err,
                        });
                    }
                    //меняем последнее сообщение в диалоге если оно есть
                    if (messages.length != 0)
                    {
                        dialog.lastMessage = ((messages[messages.length-1] as IMessage)._id).toString(); 
                    }
                    else
                    {
                        dialog.lastMessage = messageDeleteId;    
                    }
                    dialog.save();
                    this.io.emit("SERVER:CHANGE_LAST_MESSAGE",{});
                });
            })
            return res.json
            ({
                status: "success",
                message: "Message deleted",
            });
        });
    };
}

export default MessageController;
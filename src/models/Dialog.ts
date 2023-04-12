import mongoose, {Schema,Document} from "mongoose";
import {IMessage} from "./Message";
import {IUser} from "./User";

//интерфейс элемента части базы данных хранения информации о диалогах
export interface IDialog extends Document 
{
    //идентификатор собеседника диалога по нему можно определить информацию о самом собеседнике через функцию populate
    partner: IUser | string;
    //идентификатор автора диалога по нему можно определить информацию о самом авторе через функцию populate
    author: IUser | string;
    //идентификатор последнего сообщения диалога от автора к собеседнику по нему можно определить само сообщение через функцию populate
    lastMessage: IMessage | string; 
}

const DialogSchema = new Schema
(
    {
        partner: {type: Schema.Types.ObjectId, ref: "User"},
        author:  {type: Schema.Types.ObjectId, ref: "User"},
        lastMessage: {type: Schema.Types.ObjectId, ref: "Message"}
    }, 
    {
        timestamps: true
    }
);   

const DialogModel = mongoose.model<IDialog>('Dialog', DialogSchema);

export default DialogModel;
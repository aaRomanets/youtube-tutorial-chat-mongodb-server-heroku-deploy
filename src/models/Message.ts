import mongoose, {Schema,Document} from "mongoose";
import {IDialog} from "./Dialog";

//интерфейс элемента части базы данных хранения информации о сообщениях
export interface IMessage extends Document 
{
    //текст сообщения
    text:  string;           
    //идентификатор диалога к которому относится сообщение по нему можно определить информацию о диалоге через функцию populate
    dialog: IDialog | string; 
    //флаг статуса говорящего о том прочитано ли сообщение собеседником или нет
    readed:  boolean;         
}

const MessageSchema = new Schema
(
    {
        text: {type: String, require: true},
        dialog: {type: Schema.Types.ObjectId, ref: "Dialog", require: true},
        //идентификатор пользователя который послал это сообщение собеседнику, по нему можно определить
        //информацию о собеседнике через функцию populate
        user: {type: Schema.Types.ObjectId, ref: "User", require: true}, 
        readed: {type: Boolean, default: false},
        //список идентификаторов файлов в сообщении, если они в нем есть, по ним можно определить информацию о файлах через функцию populate
        attachments: [{type: Schema.Types.ObjectId, ref: "UploadFile"}]
    }, 
    {
        timestamps: true
    }
);   

const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);

export default MessageModel;
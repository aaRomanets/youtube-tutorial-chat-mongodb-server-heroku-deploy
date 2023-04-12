import mongoose, {Schema,Document} from "mongoose";
export {IUser} from "./User";
export {IMessage} from "./Message";

//интерфейс элемента части базы данных хранения файлов
export interface IUploadFile 
{
    //имя файла
    //file name
    filename: string;
    //его размер
    //his size
    size: number;   
    //его расширение
    //his extension  
    ext: string;    
    //его адрес в cloudinary
    //his address in cloudinary  
    url: string,     
    //идентификатор сообщения к которому относится этот файл по нему можно определить
    //информацию о сообщении через функцию populate
    //message ID to which belongss this file, according to it one can to define information about message via function populate 
    message: string;
    //идентификатор пользователя который послал этот файл собеседнику в качестве ссобщения 
    //или его части, по нему можно определить информацию о самом пользователе через функцию populate
    //user ID which sent this file to partner as a message or his part, 
    //according to it one can define information about itself user via function populate
    user: string; 
}

export type IUploadFileDocument = Document & IUploadFile;

const UploadFileSchema = new Schema
(
    {
        filename: String,
        size: Number,
        ext: String,
        url: String,
        message: {type: Schema.Types.ObjectId, ref: "Message", require: true},
        user: {type: Schema.Types.ObjectId, ref: "User", require: true}
    }, 
    {
        timestamps: true
    }
);   

const UploadFileModel = mongoose.model<IUploadFileDocument>('UploadFile', UploadFileSchema);

export default UploadFileModel;
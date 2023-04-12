import mongoose, {Schema,Document} from "mongoose";
import {isEmail} from "validator";
import {generatePasswordHash} from "../utils";
import differenceInMinutes from "date-fns/difference_in_minutes";

//интерфейс элемента части базы данных хранения информации о пользователях
export interface IUser extends Document {
    //почта пользователя
    email: string;  
    //полное имя пользователя    
    fullname: string;    
    //пароль пользователя зашиврованный 
    password: string; 
    //зашифрованная дата создания   
    confirm_hash: string; 
    //время просмотра сообщений собеседника или ответа на эти сообщения
    last_seen?: Date;     
}

const UserSchema = new Schema
(
    {
        email: 
        {
            type: String,
            require: 'Email address is required',
            validate: [isEmail, "Invalid email"],
            unique: true
        }, 
        fullname: 
        {
            type: String,
            required: 'Fullname is required'
        },
        password: 
        {
            type: String,
            required: 'Password is required'
        },
        confirm_hash: String,
        last_seen: 
        {
            type: Date,
            default: new Date()
        }
    }, 
    {
        timestamps: true
    }
);   

//определяем в онлайне ли собеседник или нет
UserSchema.virtual("isOnline").get(function(this:any) 
    {
        return differenceInMinutes(new Date().toISOString(), this.last_seen) < 3;
    }
);

UserSchema.set("toJSON", {
    virtuals: true,
});

UserSchema.pre<IUser>("save", async function (next) 
{
    const user = this;
    if (!user.isModified("password")) 
    {
        return next();
    }
    //шифруем пароль пользователя
    user.password = await generatePasswordHash(user.password);
    //шифруем время последнего изменения в базе данных
    user.confirm_hash = await generatePasswordHash(new Date().toString());
})  

const UserModel = mongoose.model<IUser>('User',UserSchema);

export default UserModel;
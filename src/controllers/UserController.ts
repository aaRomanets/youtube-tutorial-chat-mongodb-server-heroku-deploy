import express from "express";
import bcrypt from "bcrypt";
import {UserModel} from "../models";
import {createJWToken} from "../utils";
import { validationResult } from "express-validator";

class UserController {
    //функция получения данных об авторизованном пользователе
    getMe = (req: express.Request, res: express.Response) => 
    {
        const id = req.user._id;
        UserModel.findById(id, (err, user:any)=>
        {
            if (err || !user) 
            {
                return 
                (
                    res.status(404).json({message: "User not found"})
                )
            }
            res.json(user);
        })
    }

    //функция нахождения пользователей по имени связанным со строкой query из req.query.query 
    findUsers = (req: express.Request, res: express.Response) => 
    {
        const query: string = req.query.query as string;
        UserModel.find()
            .or(
            [
                {
                    fullname: new RegExp(query,'i')
                }, 
                {
                    email: new RegExp(query,'i')
                }
            ])
            .then((users:any) => res.json(users))
            .catch((err:any) => 
                {
                    return res.status(404).json(
                        {
                            status: "error",
                            message: err
                        }
                    )
                }
            )
    }

    //функция регистрации пользователя по электронной почте полному имени и паролю
    create = (req: express.Request, res: express.Response) => 
    {
        const postData = 
        {
            email: req.body.email,
            fullname: req.body.fullname,
            password: req.body.password
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
        {
            return res.status(422).json({errors: errors.array()});
        }

        UserModel.findOne({ email: req.body.email, fullname: req.body.fullname}, (err, userExist) => 
        {
            //существующего пользователя удаляем из базы данных
            if (userExist != undefined)
            {
                UserModel.findOneAndDelete(
                {
                    email: req.body.email,
                    fullname: req.body.fullname
                },
                (err, doc) => {
                });
            }

            //записываем данные о пользователе в базу данных
            const user = new UserModel(postData);
            user.save().then((obj: any) => 
            {
                res.json(obj);
            }).catch(reason => 
            {
                res.status(500).json(
                {
                    status: "error",
                    message: reason
                });
            })
        })
    }

    //функция авторизации пользователя
    login = (req: express.Request, res: express.Response) => 
    {
        const postData = 
        {
            email: req.body.email,
            password: req.body.password
        }; 
        const errors = validationResult(req);
        if (!errors.isEmpty()) 
        {
            return res.status(422).json({errors: errors.array()});
        }
        UserModel.findOne({email: postData.email}, (err, user: any) => 
        {
            if (err || !user) 
            {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (bcrypt.compareSync(postData.password, user.password)) 
            {
                //создаем токен пользователя при успешной проверке пароля
                const token = createJWToken(user);
                res.json(
                {
                    status: "success",
                    token
                });
            } 
            else 
            {
                res.status(403).json(
                {
                    status: "error",
                    message: "Incorrect password or email"
                })
            }
        })
    }
}

export default UserController;
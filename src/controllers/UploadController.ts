import express from "express";

import cloudinary from "../core/cloudinary";
import {UploadFileModel} from "../models";

class UploadController {
    //функция удаления файлов из базы данных файлов
    deleteFile = (res: express.Response, fileId: string): void => 
    {
        UploadFileModel.deleteOne({_id: fileId}, function(err: any)
        {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: err
                })
            }
            res.json({
                status: "success"
            })
        })
    }

    //функция загрузки файлов в базу данных по файлам
    create = (req: express.Request, res: express.Response):void => 
    {
        //идентификатор пользователя, который загружает файл
        const userId = req.user._id;
        //информация о загружаемом файле
        const file: any = req.file;
        cloudinary.v2.uploader.upload_stream({resource_type: "auto"}, (error: any, result: any) => 
        {
            if (error) 
            {
                throw new Error(error);
            }
            const fileData = 
            {
                filename: result.original_filename,
                size: result.bytes,
                ext: result.format,
                url: result.url,
                user: userId
            };
            //загружаем информацию о новом файле в базу данных
            const uploadFile = new UploadFileModel(fileData);
            uploadFile.save().then((fileObj: any) => 
            {
                res.json({
                    status: "success",
                    file: fileObj
                });
            })
            .catch((err: any) => 
            {
                res.json({
                    status: "error",
                    message: err
                });
            });
        })
        .end(file.buffer);
    };

    //функция удаления файла из базы данных по файлам которые загружаются для составления очередного сообщения
    delete = (req: express.Request, res: express.Response): void => {
        //идентификатор удаляемого файла
        const fileId: string = req.query.uid as string;
        //удаляем файл из базы данных файлов
        this.deleteFile(res, fileId);
    }
}

export default UploadController;
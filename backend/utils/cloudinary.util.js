import {v2 as cloudinary} from "cloudinary";
// const cloudinary = require('cloudinary').v2;

import fs from "fs";
// const fs =require('fs')
cloudinary.config({
    cloud_name:'duzmyzmpa',
    api_key:'667322765163825',
    api_secret:'3vbirFk2VL-InUpDy7BMdpPdRdk',
});

const uploadOnCloudinary=async(localFilePath)=>{
    try {
        
        if(!localFilePath){
            return null;
        }
        console.log("i have a localpath"+localFilePath)
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // fs.unlinkSync(localFilePath);
        return null;
    }
}

export default uploadOnCloudinary;
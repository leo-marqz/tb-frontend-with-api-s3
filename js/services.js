
//  Endpoints: 
// 	------------------------------------------------------------------------------
// 	| Endpoint                                   |       Method                  |
// 	------------------------------------------------------------------------------
// 	| ::/api/s3/list-all-buckets                 |       GET                     |
// 	| ::/api/s3/{bucket}/list-all-objects        |       GET                     |
// 	| ::/api/s3/{bucket}/download-object/{key}   |       GET                     |
// 	| ::/api/s3/{bucket}/upload-object           |       POST                    |
// 	| ::/api/s3/{bucket}/delete-object/{key}     |       DELETE                  |
// 	| ::/api/s3/{bucket}/update-object/{key}     |       PUT                     |
// 	------------------------------------------------------------------------------
// leomarqz

import {S3Object} from './s3Object.js';
import { getFolderStructure, generateTemporaryLink } from './helpers.js';

const url = "https://qxit3ar5t0.execute-api.us-east-1.amazonaws.com";
const bucket = "tb-bucket-s3";

export async function listAllObjectsFromBucketS3(){
    try{
        if(!bucket){
            return [];
        }
        let content = {};
        const response = await fetch(`${url}/api/s3/${bucket}/list-all-objects`, {method: 'GET'});
        if(response.ok){
            let data = await response.json();
            data = JSON.parse(data.body);
            if(Array.isArray(data)){
                data.forEach((s3Object)=>{
                    let obj = new S3Object(s3Object.key, s3Object.bucket, s3Object.storage, s3Object.size);
                    if(content[getFolderStructure(s3Object.key)]){
                        content[getFolderStructure(s3Object.key)].push(obj);
                    }else{
                        content[getFolderStructure(s3Object.key)] = [obj];
                    }
                })
            }
            return content;
        }else{
            return {};
        }
    }catch(error){
        console.error('Error while listing all objects from S3:', error);
        return {};
    }
}

export async function downloadObjectFromBucketS3(key){
    try{
        if(!bucket ||!key){
            return null;
        }
        const headers = new Headers();
        headers.append('s3-object-key', key);

        const response = await fetch(`${url}/api/s3/${bucket}/download-object`, {
            method: 'GET',
            headers: headers
        });
        if(response.ok){
            const data = await response.json();
            const base64String = data.body;
            const contentType = data.contentType || 'application/octet-stream'; 
            const byteCharacters = atob(base64String);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
    
            const blob = new Blob([byteArray], { type: contentType });
            const blobUrl = URL.createObjectURL(blob);
    
            generateTemporaryLink( document.body, blobUrl, key.split('/').pop() );

        }else{
            console.error('Error while downloading object from S3:', response.statusText);
        }
    }catch(error){
        console.error('Error while downloading object from S3:', error);
    }
}

export async function getPresignedUrlForDownloadObjectS3(key){
    try{
        if(!bucket ||!key){
            console.error('Bucket or key not provided');
        }
        const headers = new Headers();
        headers.append('s3-object-key', key);

        const response = await fetch(`${url}/api/s3/${bucket}/gen-presigned-url/object`, {
            method: 'GET',
            headers: headers
        });

        if(response.ok){
            let data = await response.json();
            data = JSON.parse(data.body);
            console.log(data);
            return data.url;
        }else{
            console.error('Error while getting presigned URL for download from S3:', response.statusText);
            return null;
        }
    }catch(error){
        console.error('Error while getting presigned URL for download from S3:', error);
        return null;
    }
}

/*
* ::/api/s3/{bucket}/upload-object
*/
export async function uploadObjectToBucketS3(formData = new FormData()){
    try{
        const response = await fetch(`${url}/api/s3/${bucket}/upload-object`, {
            method:  'POST', 
            body: formData
        });
        if(response.ok){
            console.log("Object uploaded successfully");
            let data = await response.json();
            return JSON.parse(data.body);
        }else{
            console.error("Error uploading object to bucket", response.statusText);
            return null;
        }
    }catch(error){
        console.error("Error uploading object to bucket", error);
        return null;
    }
}
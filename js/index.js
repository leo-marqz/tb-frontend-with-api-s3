import {
    listAllObjectsFromBucketS3, 
    downloadObjectFromBucketS3, 
    getPresignedUrlForDownloadObjectS3,
    uploadObjectToBucketS3
} from './services.js';
import {
    calculateSizeObjects3, 
    doesThisS3ObjectBelongToAFolder, 
    generateTemporaryLink
} from './helpers.js';

window.onload = async (e)=>{
    const objects = await listAllObjectsFromBucketS3();
    loadDataIntoTable(objects);
    handleFormToUploadMultipleFiles();
}

function loadDataIntoTable(data){
    if(data != null && typeof data === 'object' && Object.keys(data).length > 0){

        let folders = Object.keys(data);
        folders.sort();

        folders.forEach((folder)=>{
            insertFolderIntoTable(folder);

            const folderData = data[folder];

            folder = folder.concat('/');
            
            folderData.forEach(async (object)=>{
                if(object.key  != folder){
                    await insertObjectIntoTable(object.key, object.storageClass, object.size);
                }
            });
        });
    }
    
}

function insertFolderIntoTable(folderName){
    const tableBody = document.getElementById('list-objects-s3');
    let row = document.createElement('tr');
    let cellKey = document.createElement('td');
    let cellStorageClass = document.createElement('td');
    let cellSize = document.createElement('td');
    
    cellKey.textContent = folderName;
    cellKey.className = 'fw-bold'
    cellStorageClass.textContent = '---';
    cellSize.textContent = '---';

    row.appendChild(cellKey);
    row.appendChild(cellStorageClass);
    row.appendChild(cellSize);
    tableBody.appendChild(row);
}

async function insertObjectIntoTable(key, storageClass, size){
    const tableBody = document.getElementById('list-objects-s3');
    let row = document.createElement('tr');
    let cellKey = document.createElement('td');
    let cellStorageClass = document.createElement('td');
    let cellSize = document.createElement('td');
    
    let sizes = calculateSizeObjects3(size);
    const link = document.createElement('a');
    link.href = `${key}`;
    link.title = `${key}`;
    link.textContent = key;
    link.className = 'text-decoration-none';
    link.addEventListener('click', async (e)=>{
        e.preventDefault();
        await eventClickOnS3ObjectKey(e, key);
    });

    cellKey.appendChild(link);

    if(doesThisS3ObjectBelongToAFolder(key)){
        cellKey.className = ' ps-5';
    }
    cellStorageClass.textContent = storageClass;
    cellSize.innerHTML = `<span class='text-muted'>${sizes.KB} KB</span> <strong>|</strong> <span class='text-dark'>${sizes.MB} MB</span>`;
    
    row.appendChild(cellKey);
    row.appendChild(cellStorageClass);
    row.appendChild(cellSize);
    tableBody.appendChild(row);
}

async function eventClickOnS3ObjectKey(e, key){
    e.preventDefault();
    
    Swal.fire({
        title: "Que accion deseas ejecutar?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Descargar",
        denyButtonText: `Visualizar`
      }).then(async (result) => {
        
        if (result.isConfirmed) {
          console.log("Descargar archivo...", key);
          await downloadObjectFromBucketS3(key);
        } else if (result.isDenied) {
            console.log("Visualizar archivo...", key);
            let url = await getPresignedUrlForDownloadObjectS3(key);
            generateTemporaryLink( document.body, url, key.split('/').pop() );
        }

      });
      
}

function handleFormToUploadMultipleFiles(){
    const form = document.getElementById('form');
    form.addEventListener('submit', async (e)=>{
        e.preventDefault();
        let btn = e.target.elements['btn-upload-files'];
        btn.innerHTML = 'Cargando...';
        btn.disabled = true;

        let formData = new FormData();
        let files = e.target.elements['form-files'].files;
        
        for(let i=0; i<files.length; i++){
            formData.append(`file${i}`, files[i], files[i].name);
        }

        let response = await uploadObjectToBucketS3(formData);
        console.log(response);

        if(!response){
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Fallo al subir el archivo al bucket.",
              });
        }else{
            Swal.fire({
                icon: "success",
                title: "Operacion de subida de archivos al bucket exitoso.",
              });

            form.reset();
            resetTable();

            let objects = await listAllObjectsFromBucketS3();
            loadDataIntoTable(objects);
        }

        btn.innerHTML = 'Enviar';
        btn.disabled = false;

    });
}

function resetTable(){
    const tableBody = document.getElementById('list-objects-s3');
    tableBody.innerHTML = '';
}
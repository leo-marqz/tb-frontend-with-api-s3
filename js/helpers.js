
export function calculateSizeObjects3(size){
    let sizeInKB = size / 1024;
    let sizeInMB = sizeInKB / 1024;
    let sizeInGB = sizeInMB / 1024;
    return {
        KB: sizeInKB.toFixed(2),
        MB: sizeInMB.toFixed(2),
        GB: sizeInGB.toFixed(2)
    };
}

export function isFolder(key){
    return key.endsWith('/');
}

export function doesThisS3ObjectBelongToAFolder(key){
    return key.includes('/');
}

export function getFolderStructure(key){
    let folders = key.split('/');
    folders.pop();
    return folders.join('/') || "/";
}

export function generateTemporaryLink(bodyHtmlElement, url, key){
    let link = document.createElement('a');
    link.target = '_blank';
    link.href = url;
    link.download = key; 
    bodyHtmlElement.appendChild(link);
    link.click();
    bodyHtmlElement.removeChild(link);
}
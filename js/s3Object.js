
export class S3Object {
    constructor(key, bucketName, storageClass, size) {
        this.key = key;
        this.bucketName = bucketName;
        this.storageClass = storageClass;
        this.size = size;
    }

    setKey(key){
        this.key = key;
    }

    getKey() {
        return this.key;
    }

    setBucketName(bucketName) {
        this.bucketName = bucketName;
    }
    
    getBucketName() {
        return this.bucketName;
    }
    
    setStorageClass(storageClass) {
        this.storageClass = storageClass;
    }

    getStorageClass() {
        return this.storageClass;
    }
    
    setSize(size) {
        this.size = size;
    }

    getSize() {
        return this.size;
    }
}
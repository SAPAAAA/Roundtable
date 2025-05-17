// backend/services/s3.service.js
import {s3Client} from '#configs/aws.config.js';
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {InternalServerError, NotFoundError} from "#errors/AppError.js";

class S3Service {

    async uploadObject(key, body, contentType, bucketName) {
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: body,
            ContentType: contentType,
        };

        try {
            const command = new PutObjectCommand(params);
            await s3Client.send(command);
            return key;
        } catch (error) {
            throw new InternalServerError(error.message);
        }
    }

    async getObject(key, bucketName) {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        try {
            const command = new GetObjectCommand(params);
            const response = await s3Client.send(command);
            return response.Body;
        } catch (error) {
            if (error.name === "NoSuchKey") {
                throw new NotFoundError("Object not found");
            }
            throw new InternalServerError(error.message);
        }
    }

    async deleteObject(key, bucketName = this.mediaBucketName) {
        const params = {
            Bucket: bucketName,
            Key: key,
        };

        try {
            const command = new DeleteObjectCommand(params);
            return await s3Client.send(command);
        } catch (error) {
            throw new InternalServerError(error.message);
        }
    }
}

export default new S3Service();

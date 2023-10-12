import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as S3 from 'aws-sdk/clients/s3.js';

@Injectable()
export class AWSS3Service {
  private s3: S3;
  private bucketName: string;
  private aiBucketName: string;
  private nodeEnv: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      region: this.config.get('S3_REGION'),
    });

    this.bucketName = this.config.get('S3_BUCKET');
    this.aiBucketName = this.config.get('S3_AI_BUCKET');
    this.nodeEnv = this.config.get('NODE_ENV');
  }

  // TODO: Don't save full url in the database in case S3 bucket was changed -> Save relative path.
  // return `/${this.config.get('NODE_ENV')}/${directoryName}/${fileName}`;
  async uploadFile(
    file: Express.Multer.File,
    directoryName: string,
    fileName: string,
  ) {
    const params = {
      Bucket: this.bucketName,
      Key: `${this.nodeEnv}/${directoryName}/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read',
    };

    const options = {
      partSize: 20 * 1024 * 1024,
      queueSize: 1,
    }; // 20 MB

    // Uploading files to the bucket
    return await this.s3
      .upload(params, options)
      .promise()
      .then((data) => {
        return data.Location;
      });
  }

  async checkAIVideos(directoryName: string, gameId: number) {
    const params = {
      Bucket: this.aiBucketName,
      Prefix: `${directoryName}/${gameId}`,
    };

    return await this.s3
      .listObjects(params, (err, data) => {
        if (err) console.error(err);
      })
      .promise()
      .then((data) =>
        data.Contents.map(
          (content) =>
            `https://${this.aiBucketName}.s3.eu-north-1.amazonaws.com/${content.Key}`,
        ),
      );
  }

  async uploadAIVideo(
    file: Express.Multer.File,
    directoryName: string,
    fileName: string,
  ) {
    const params = {
      Bucket: this.aiBucketName,
      Key: `${directoryName}/${fileName}`,
      Body: file.buffer,
      ACL: 'public-read',
    };

    const options = {
      partSize: 100 * 1024 * 1024,
      queueSize: 1,
    }; // 100 MB

    // Uploading files to the bucket
    return await this.s3
      .upload(params, options)
      .promise()
      .then((data) => {
        return data.Location;
      });
  }

  async deleteExistingImages(directoryName: string, fileName: string) {
    const params = {
      Bucket: this.bucketName,
      Prefix: `${this.nodeEnv}/${directoryName}/${fileName}`,
    };

    return await this.s3
      .listObjects(params, (err, data) => {
        if (err) console.error(err);
      })
      .promise()
      .then(async (data) => {
        const existingFiles = data.Contents.map((obj) => obj.Key);
        if (existingFiles && existingFiles.length > 0) {
          for (var file of existingFiles) {
            await this.deleteFile(file.split('/')[1], file.split('/')[2]);
          }
        }
      });
  }

  async deleteFile(directoryName: string, fileName: string) {
    const params = {
      Bucket: this.bucketName,
      Key: `${this.nodeEnv}/${directoryName}/${fileName}`,
    };

    return await this.s3.deleteObject(params).promise();
  }
}

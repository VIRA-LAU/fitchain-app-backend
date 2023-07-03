import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AWSS3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private config: ConfigService) {
    AWS.config.update({
      accessKeyId: this.config.get(
        'AWS_ACCESS_KEY_ID',
      ),
      secretAccessKey: this.config.get(
        'AWS_SECRET_ACCESS_KEY',
      ),
      region: this.config.get('S3_REGION'),
    });

    this.s3 = new AWS.S3();
    this.bucketName = `${this.config.get(
      'S3_BUCKET',
    )}/${this.config.get('NODE_ENV')}`;
  }

  async uploadFile(
    file: Express.Multer.File,
    directoryName: string,
    fileName: string,
  ) {
    const params = {
      Bucket: `${this.bucketName}/${directoryName}`,
      Key: fileName,
      Body: file.buffer,
      ACL: 'public-read-write',
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

  async checkExisting(
    directoryName: string,
    fileName: string,
  ) {
    const params = {
      Bucket: `${this.bucketName}/${directoryName}`,
      Key: fileName,
    };

    return await this.s3
      .headObject(
        params,
        async (err, metadata) => {
          if (!err && metadata) return metadata;
        },
      )
      .promise();
  }

  async deleteFile(
    directoryName: string,
    fileName: string,
  ) {
    const params = {
      Bucket: `${this.bucketName}/${directoryName}`,
      Key: fileName,
    };

    return await this.s3
      .deleteObject(params)
      .promise();
  }
}

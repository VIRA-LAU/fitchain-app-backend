import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class AWSS3Service {
  private s3: AWS.S3;
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
  }

  async uploadFile(
    file: Express.Multer.File,
    bucketName: string,
    fileName: string,
  ) {
    const params = {
      Bucket: `${this.config.get(
        'S3_BUCKET',
      )}/${bucketName}`,
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
}

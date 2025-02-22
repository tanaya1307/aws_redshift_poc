const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const s3 = require('aws-cdk-lib/aws-s3');

class S3Stack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an S3 bucket
    const myBucket = new s3.Bucket(this, 'my-redshihft-poc-bucket', {
      versioned: true,  // Enable versioning
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Remove the bucket when the stack is deleted
      autoDeleteObjects: true, // Automatically delete objects when the bucket is removed
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block public access
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: myBucket.bucketName,
      description: 'The name of the S3 bucket',
      exportName: 'S3BucketName', // Export name for cross-stack references
    });
  }
}

module.exports = { S3Stack };

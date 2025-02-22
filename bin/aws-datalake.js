#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
require('dotenv').config(); 

const { VpcStack } = require('../lib/vpc-stack');
const { RedshiftStack } = require('../lib/redshift-stack');
const { S3Stack } = require('../lib/s3-stack');
const { GlueRedshiftConnectionStack } = require('../lib/GlueRedshiftConnectionStack');

const app = new cdk.App();

// Optionally, check if the necessary environment variables are set
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('AWS credentials are not set in the environment.');
  process.exit(1);
}

// Deploy the VPC stack
const vpcStack = new VpcStack(app, 'VpcStack', {
  env: {
    account: process.env.AWS_ACCOUNT_ID, // or AWS_PROFILE
    region: process.env.AWS_REGION
  }
});

// Log the VPC properties
console.log('VPC ID:', vpcStack.vpc.vpcId);
console.log('VPC CIDR:', vpcStack.vpc.vpcCidrBlock);
console.log('Public Subnets:', vpcStack.vpc.publicSubnets.map(subnet => subnet.subnetId));


const redshifStack=new RedshiftStack(app, 'RedshiftStack', {
  vpc: vpcStack.vpc, // Passing the VPC from VpcStack
  env: { region: process.env.AWS_REGION } // Specify your region if needed
});

new S3Stack(app, 'S3Stack', {
  env: { region: process.env.AWS_REGION } // Specify your region if needed
});

new GlueRedshiftConnectionStack(app, 'GlueRedshiftConnectionStack', {
  vpc: vpcStack.vpc, // Passing the VPC from VpcStack
  redshiftSecurityGroup: redshifStack.redshiftSecurityGroup, // Passing the Redshift security group
  env: { region: process.env.AWS_REGION } // Specify your region if needed
});

app.synth();

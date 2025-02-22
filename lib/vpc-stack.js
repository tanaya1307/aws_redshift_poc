const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const ec2 = require('aws-cdk-lib/aws-ec2');

class VpcStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create a custom VPC with at least 3 availability zones
    this.vpc = new ec2.Vpc(this, 'RedshiftPOCVPC', {
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        {
          cidrMask: 24, // Each subnet will have a /24 CIDR block, providing 256 IP addresses
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC, // Public subnets for Redshift
        },
      ],
      natGateways: 0, // No NAT Gateway required
    });

    // Add an S3 Gateway Endpoint to the VPC
    new ec2.GatewayVpcEndpoint(this, 'S3Endpoint', {
      vpc: this.vpc,
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: ec2.SubnetType.PUBLIC }],
    });

    // Output the VPC ID for cross-stack references
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'ID of the custom VPC',
      exportName: 'VpcId',
    });

    // Output the public subnet IDs
    this.publicSubnets = this.vpc.publicSubnets.map((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnet${index + 1}Id`, {
        value: subnet.subnetId,
        description: `ID of public subnet ${index + 1}`,
        exportName: `PublicSubnet${index + 1}Id`,
      });
      return subnet;
    });
  }
}

module.exports = { VpcStack };

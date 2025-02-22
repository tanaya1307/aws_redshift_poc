const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const ec2 = require('aws-cdk-lib/aws-ec2');
const redshiftserverless = require('aws-cdk-lib/aws-redshiftserverless');

class RedshiftStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Use the VPC object passed as a prop
    const vpc = props.vpc;

    // Create a security group for Redshift
    this.redshiftSecurityGroup = new ec2.SecurityGroup(this, 'RedshiftSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'RedshiftSecurityGroup',
    });

    // Allow inbound traffic on the Redshift port (default is 5439)
    this.redshiftSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5439),
      'Allow inbound traffic to Redshift on port 5439'
    );


    const redshiftNamespace = new redshiftserverless.CfnNamespace(this, 'RedshiftNamespace', {
      namespaceName: 'my-redshift-poc-namespace', // Choose a valid namespace name
      dbName: 'my-redshift-poc-database', // Initial database name
      adminUsername: 'adminUsername',
      adminUserPassword: 'Passw0rd#123', // Strong admin password
      iamRoles: [], // Add IAM roles if needed
    });

    const redshiftWorkgroup = new redshiftserverless.CfnWorkgroup(this, 'RedshiftServerlessWorkgroup', {
      workgroupName: 'my-redshift-workgroup',
      namespaceName: redshiftNamespace.namespaceName,
      subnetIds: [
        'subnet-0edb7f4004f51b808', // Manually created subnet ID 1
        'subnet-07b59a6969bc6ff5d', // Manually created subnet ID 2
        'subnet-0ca84ffb814c50182'  // Manually created subnet ID 3
      ],
    
      securityGroupIds: [redshiftSecurityGroup.securityGroupId],
      publiclyAccessible: true,
      enhancedVpcRouting: true,
    });
    // Output the Redshift Workgroup name
    new cdk.CfnOutput(this, 'RedshiftWorkgroupName', {
      value: redshiftWorkgroup.attrWorkgroupName || 'UnknownWorkgroupName',
      description: 'Redshift Workgroup Name',
      exportName: 'RedshiftWorkgroupName',
    });

    // Output the VPC endpoint information if available
    new cdk.CfnOutput(this, 'RedshiftVpcEndpoint', {
      value: redshiftWorkgroup.attrEndpointAddress || 'EndpointNotAvailable',
      description: 'Redshift VPC Endpoint Information',
      exportName: 'RedshiftVpcEndpoint',
    });
  }
}

module.exports = { RedshiftStack };

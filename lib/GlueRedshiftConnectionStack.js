const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const glue = require('aws-cdk-lib/aws-glue');
const ec2 = require('aws-cdk-lib/aws-ec2');
const iam = require('aws-cdk-lib/aws-iam');

class GlueRedshiftConnectionStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Use the VPC object passed as a prop
    const vpc = props.vpc;

    // IAM role for Glue
    const glueRole = new iam.Role(this, 'GlueRole', {
      assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRedshiftFullAccess'), // Ensure Glue can access Redshift
      ],
    });

    // Create a Glue connection to Redshift
    const redshiftConnection = new glue.CfnConnection(this, 'RedshiftGlueConnection', {
      connectionInput: {
        name: 'RedshiftConnection',
        connectionType: 'JDBC',
        connectionProperties: {
          USERNAME: 'adminUsername', // Set the Redshift user
          PASSWORD: 'Passw0rd#123', // Set the Redshift password
          CONNECTION_URL: `jdbc:redshift://my-redshift-workgroup.203918841130.us-east-1.redshift-serverless.amazonaws.com:5439/my-redshift-poc-database`, // Replace with actual Redshift endpoint
          // Optional: Additional properties like SSL or Timezone
        },
        physicalConnectionRequirements: {
          availabilityZone: vpc.availabilityZones[0],
          subnetId: vpc.publicSubnets[0].subnetId, // Use your correct subnet
          securityGroupIdList: [props.redshiftSecurityGroup.securityGroupId],
        },
      },
    });

    // Grant Glue the permission to assume the IAM role
    glueRole.grantAssumeRole(redshiftConnection);

    // Output connection details
    new cdk.CfnOutput(this, 'GlueConnectionDetails', {
      value: redshiftConnection.ref,
      description: 'Glue Redshift Connection Details',
    });
  }
}

module.exports = { GlueRedshiftConnectionStack };

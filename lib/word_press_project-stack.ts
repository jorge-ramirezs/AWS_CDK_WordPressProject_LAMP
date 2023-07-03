import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { SubnetType } from "aws-cdk-lib/aws-ec2";

export class WordPressProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const wp_vpc = new ec2.Vpc(this, "WP-Vpc", {
      vpcName: "WP-VPC",
      ipAddresses: ec2.IpAddresses.cidr("192.168.0.0/16"),
      subnetConfiguration: [
        {
          cidrMask: 20,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: "WPPrivate",
        },
        {
          cidrMask: 20,
          subnetType: ec2.SubnetType.PUBLIC,
          name: "WPPublic",
        },
      ],
    });

    const web_dmz = new ec2.SecurityGroup(this, "WebDMZ", {
      vpc: wp_vpc,
      description: 'Allow ssh, http and https connections',
    });
    web_dmz.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "Allow ssh access");
    web_dmz.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "Allow http access");
    web_dmz.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), "Allow https connections");

    const ec2_instance = new ec2.Instance(this, "WPServer", {
      vpc: wp_vpc,
      securityGroup: web_dmz,
      associatePublicIpAddress: true,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      keyName: "MyUserKP",
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    });

    new cdk.CfnOutput(this, 'Website URL', {value: ec2_instance.instancePublicDnsName});
  }
}

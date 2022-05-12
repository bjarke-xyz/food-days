import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { EventType } from "aws-cdk-lib/aws-s3";
export class FoodDaysApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "FoodDaysDataSources", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const dynamoTable = new Table(this, "food-days", {
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      tableName: "food-days",
      removalPolicy: RemovalPolicy.DESTROY,
      readCapacity: 1,
      writeCapacity: 1,
    });

    const defaultLambdaOptions: NodejsFunctionProps = {
      runtime: Runtime.NODEJS_14_X,
      handler: "main",
      environment: {
        BUCKET: bucket.bucketName,
        TABLE: dynamoTable.tableName,
        NODE_ENV: "production",
      },
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
      logRetention: RetentionDays.THREE_DAYS,
    };

    const getDataHandler = new NodejsFunction(this, "get-data-handler", {
      ...defaultLambdaOptions,
      entry: path.join(__dirname, "../src/lambdas/get-data-handler.ts"),
    });
    dynamoTable.grantReadData(getDataHandler);

    const fetchDataHandler = new NodejsFunction(this, "fetch-data-handler", {
      ...defaultLambdaOptions,
      timeout: Duration.seconds(15),
      entry: path.join(__dirname, "../src/lambdas/fetch-data-handler.ts"),
    });
    bucket.grantReadWrite(fetchDataHandler);

    const parseDataHandler = new NodejsFunction(this, "parse-data-handler", {
      ...defaultLambdaOptions,
      timeout: Duration.seconds(15),
      entry: path.join(__dirname, "../src/lambdas/parse-data-handler.ts"),
    });
    bucket.grantRead(parseDataHandler);
    dynamoTable.grantReadWriteData(parseDataHandler);

    const apiGateway = new RestApi(this, "food-days-api", {
      restApiName: "Food days API",
      description: "Food days API",
      domainName: {
        certificate: Certificate.fromCertificateArn(
          this,
          "5762008f-3e14-4222-abe5-265102d39eb8",
          "arn:aws:acm:eu-north-1:573355056124:certificate/5762008f-3e14-4222-abe5-265102d39eb8"
        ),
        domainName: "food-days-api.bjarke.xyz",
      },
      defaultCorsPreflightOptions: {
        allowCredentials: true,
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });

    const getDataHandlerIntegration = new LambdaIntegration(getDataHandler, {
      requestTemplates: { "application/json": '{"statusCode": "200"}' },
    });
    const eventsResource = apiGateway.root.addResource("events");
    eventsResource.addMethod("GET", getDataHandlerIntegration);

    const cronRule = new Rule(this, "CronRule", {
      schedule: Schedule.expression("rate(1 day)"),
      enabled: false,
    });
    cronRule.addTarget(new LambdaFunction(fetchDataHandler));

    parseDataHandler.addEventSource(
      new S3EventSource(bucket, {
        events: [EventType.OBJECT_CREATED_PUT],
      })
    );
  }
}

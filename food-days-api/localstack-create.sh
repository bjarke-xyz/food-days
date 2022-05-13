#!/usr/bin/env bash

# S3
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fooddaysdatasources954e8dce --region eu-north-1

# DynamoDB
aws --endpoint-url=http://localhost:4566 dynamodb create-table --table-name fooddays5B9B09AC \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
    --region eu-north-1
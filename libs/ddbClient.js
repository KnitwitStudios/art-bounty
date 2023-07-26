const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const credentials = {
    region: "us-east-1",
    credentials: {
      accessKeyId: "XXXXXXXXXXXXX",
      secretAccessKey: "XXXXXXXXXXXXX"
    }
  };

exports.ddbClient = new DynamoDBClient(credentials);
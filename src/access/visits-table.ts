import { DynamoDB } from "aws-sdk";
import { Table } from "dynamodb-toolbox";

const DocumentClient = new DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
});

export const VisitsTable = new Table({
  name: process.env.VISITS_TABLE,
  partitionKey: "pk",
  sortKey: "sk",
  DocumentClient,
});

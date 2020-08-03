import { Entity } from "dynamodb-toolbox";
import { VisitsTable } from "./visits-table";

export const RepoCounter = new Entity({
  name: "counter",
  attributes: {
    organization: { partitionKey: true },
    sk: { sortKey: true, hidden: true },
    repository: ["sk", 0],
    count: { type: "number" },
  },
  table: VisitsTable,
});

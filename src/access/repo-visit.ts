import { Entity } from "dynamodb-toolbox";
import { VisitsTable } from "./visits-table";

export const RepoVisit = new Entity({
  name: "visit",
  attributes: {
    organization: { partitionKey: true },
    sk: { sortKey: true, hidden: true },
    repository: ["sk", 0],
    ip: ["sk", 1],
    timestamp: ["sk", 2],
  },
  table: VisitsTable,
});

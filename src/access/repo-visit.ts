import { Entity } from "dynamodb-toolbox";
import { VisitsTable } from "./visits-table";

const RepoVisit = new Entity({
  name: "visit",
  attributes: {
    pk: { partitionKey: true, hidden: true, delimiter: "/" },
    vcs: ["pk", 0],
    owner: ["pk", 1],
    sk: { sortKey: true, hidden: true },
    repository: ["sk", 0],
    ip: ["sk", 1],
    timestamp: ["sk", 2],
    ipLookup: 'map',
    source: 'string'
  },
  table: VisitsTable,
});

export async function getVisits(): Promise<Visit[]> {
  const res = await RepoVisit.scan({
    entity: 'visit',
    filters: [
      { attr: '_et', eq: 'visit'}
    ]});
  return res.Items;
}

export function recordVisit(visit: Visit): Promise<any> {
  return RepoVisit.put(visit);
}

export interface Visit {
  vcs: string;
  owner: string;
  repository: string;
  ip: string;
  ipLookup?: {
    org: string;
    city: string;
    regionName: string;
  }
  source?: string;
  timestamp: string;
};

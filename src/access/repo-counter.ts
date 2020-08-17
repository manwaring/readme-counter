import { Entity } from "dynamodb-toolbox";
import { VisitsTable } from "./visits-table";
import { Visit } from "./repo-visit";

const RepoCounter = new Entity({
  name: "counter",
  attributes: {
    pk: { partitionKey: true, hidden: true, delimiter: "/" },
    vcs: ["pk", 0],
    owner: ["pk", 1],
    sk: { sortKey: true, hidden: true },
    repository: ["sk", 0],
    count: { type: "number" },
  },
  table: VisitsTable,
});

export function updateCounter(visit: Visit): Promise<any> {
  const { owner, vcs, repository } = visit;
  const counter = { owner, vcs, repository, count: { $add: 1 }, };
  return RepoCounter.update(counter);
}

export async function getCounterBadge(vcs: string, owner: string, repository: string): Promise<string> {
  const res = await RepoCounter.get({ vcs, owner, repository });
  return generateBadge(res?.Item?.count);
}

// https://www.rapidtables.com/web/tools/svg-viewer-editor.html
// https://www.browserling.com/tools/text-replace
function generateBadge(count: number = 0): string {
  count++; // this current visit likely hasn't been captured yet
  const label = "Readme visits";
  const countLength = count.toString().length;
  const labelWidth = 85;
  const countWidth = 24 + 1.5 * countLength;
  const width = labelWidth + countWidth;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" version="1.1">\
    <rect width="${labelWidth}" height="20" fill="#555"/>\
    <rect x="${labelWidth}" width="${countWidth}" height="20" fill="#4C1"/>\
    <rect rx="3" width="${width}" height="20" fill="transparent"/>\
    <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">\
      <text x="${labelWidth / 2}" y="14">${label}</text>\
      <text x="${labelWidth + countWidth / 2}" y="14">${count}</text>\
    </g>\
  </svg>`;
}

export interface Counter {
  vcs: string;
  owner: string;
  repository: string;
  count: number;
}

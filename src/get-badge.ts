import "source-map-support/register";
import * as fetch  from "node-fetch";
import { httpApi } from "@manwaring/lambda-wrapper";
import { SNS } from "aws-sdk";
import { getCount } from "./access";

const sns = new SNS({ apiVersion: "2010-03-31" });

export const handler = httpApi(async ({ event, success, error }) => {
    try {
      const { vcs, owner, repository } = event.pathParameters;
      const [count] = await Promise.all([getCount(vcs, owner, repository), recordVisit(vcs, owner, repository, event)]);
      const badge = await getBadge(count, event.rawQueryString);
      const headers = {
        'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
        'Content-Type': 'image/svg+xml'
      };
      return success({ body: badge, headers, json: false } );
    } catch (err) {
      return error({ err });
    }
  }
);

async function getBadge(count: number = 0, queryString: String): Promise<string> {
  count++; // this current visit likely hasn't been captured yet
  const label = 'Readme%20visits';
  const color = 'brightgreen';
  const url = `https://img.shields.io/badge/${label}-${count}-${color}?${queryString}`;
  const res = await fetch(url);
  return res.text();
}

function recordVisit(vcs: string, owner: string, repository: string, event: any): Promise<any> {
  const { requestContext: { http: { sourceIp }, timeEpoch } } = event;
  const visit = { vcs, owner, repository, ip: sourceIp, timestamp: timeEpoch, };
  const params = {
    Message: JSON.stringify(visit),
    TopicArn: process.env.VISITS_TOPIC,
  };
  return sns.publish(params).promise();
}

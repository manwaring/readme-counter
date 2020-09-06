import "source-map-support/register";
import { httpApi } from "@manwaring/lambda-wrapper";
import { SNS } from "aws-sdk";
import { getCount, Visit } from "./access";
import { getBadgeFromShieldsIO } from './badges';

const sns = new SNS({ apiVersion: "2010-03-31" });

export const handler = httpApi(async ({ event, success, error }) => {
    try {
      const { vcs, owner, repository } = event.pathParameters;
      let [count] = await Promise.all([getCount(vcs, owner, repository), recordVisit(vcs, owner, repository, event)]);
      count++;
      const badge = await getBadgeFromShieldsIO(count, event.rawQueryString);
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

function recordVisit(vcs: string, owner: string, repository: string, event): Promise<any> {
  const { anonymous } = event.queryStringParameters;
  if (!anonymous) {
    const { requestContext: { http: { sourceIp }, timeEpoch } } = event;
    const source = getVisitSource(event);
    const visit: Visit = { vcs, owner, repository, ip: sourceIp, timestamp: timeEpoch, source };
    const params = {
      Message: JSON.stringify(visit),
      TopicArn: process.env.VISITS_TOPIC,
    };
    return sns.publish(params).promise();
  }
}

function getVisitSource(event): string {
  return isNpmVisitSource(event) ? 'npm' : isGitHubVisitSource(event) ? 'GitHub' : undefined;
}

function isNpmVisitSource(event): boolean {
  return event?.headers['referer']?.toUpperCase()?.indexOf('NPMJS.COM') > -1;
}

function isGitHubVisitSource(event): boolean {
  return event?.headers['user-agent']?.toUpperCase()?.indexOf('GITHUB') > -1;
}

import "source-map-support/register";
import { httpApi } from "@manwaring/lambda-wrapper";
import { SNS } from "aws-sdk";
import { getCount } from "./access";
import { getBadgeFromShieldsIO } from './badges';

const sns = new SNS({ apiVersion: "2010-03-31" });

export const handler = httpApi(async ({ event, success, error }) => {
    try {
      const { vcs, owner, repository } = event.pathParameters;
      let [count] = await Promise.all([getCount(vcs, owner, repository), recordVisit(vcs, owner, repository, event)]);
      count++;
      const link = `https://${vcs}.com/${owner}/${repository}`;
      const badge = await getBadgeFromShieldsIO(count, link, event.rawQueryString);
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

function recordVisit(vcs: string, owner: string, repository: string, event: any): Promise<any> {
  const { anonymous } = event.queryStringParameters;
  if (!anonymous) {
    const { requestContext: { http: { sourceIp }, timeEpoch } } = event;
    const visit = { vcs, owner, repository, ip: sourceIp, timestamp: timeEpoch, };
    const params = {
      Message: JSON.stringify(visit),
      TopicArn: process.env.VISITS_TOPIC,
    };
    return sns.publish(params).promise();
  }
}

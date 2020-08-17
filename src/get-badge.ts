import "source-map-support/register";
import { httpApi } from "@manwaring/lambda-wrapper";
import { SNS } from "aws-sdk";
import { getCounterBadge } from "./access";

const sns = new SNS({ apiVersion: "2010-03-31" });

export const handler = httpApi(async ({ event, success, error }) => {
    try {
      const { vcs, owner, repository } = event.pathParameters;
      const [ badge ] = await Promise.all([getCounterBadge(vcs, owner, repository), recordVisit(vcs, owner, repository, event)]);
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
  const { requestContext: { http: { sourceIp }, timeEpoch } } = event;
  const visit = { vcs, owner, repository, ip: sourceIp, timestamp: timeEpoch, };
  const params = {
    Message: JSON.stringify(visit),
    TopicArn: process.env.VISITS_TOPIC,
  };
  return sns.publish(params).promise();
}

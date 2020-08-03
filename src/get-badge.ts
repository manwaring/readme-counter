import "source-map-support/register";
import { httpApi, HttpApiSignature } from "@manwaring/lambda-wrapper";
import { SNS } from "aws-sdk";
import { RepoCounter } from "./access/repo-counter";

const sns = new SNS({ apiVersion: "2010-03-31" });

export const handler = httpApi(
  async ({ event, success, error }: HttpApiSignature) => {
    try {
      const { organization, repository } = event.pathParameters;
      await recordVisit(organization, repository, event);
      const res = await RepoCounter.get({ organization, repository });
      return success(res);
    } catch (err) {
      return error(err);
    }
  }
);

function recordVisit(organization, repository, event): Promise<any> {
  const visit = {
    organization,
    repository,
    ip: event.requestContext.http.sourceIp,
    timestamp: event.requestContext.timeEpoch,
  };
  const params = {
    Message: JSON.stringify(visit),
    TopicArn: process.env.VISITS_TOPIC,
  };
  return sns.publish(params).promise();
}

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
      const badge = generateBadge(res.Item.count);
      return success(badge);
    } catch (err) {
      return error(err);
    }
  }
);

function generateBadge(count: number): string {
  const label = "Visit count";
  const countLength = count.toString().length;
  const labelWidth = 70;
  const countWidth = 24 + 1 * countLength;
  const width = labelWidth + countWidth;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" version="1.1">\
  <rect width="${labelWidth}" height="20" fill="#555"/>\
  <rect x="${labelWidth}" width="${countWidth}" height="20" fill="#4C1"/>\
  <rect rx="3" width="${width}" height="20" fill="transparent"/>\
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">\
  <text x="${labelWidth / 2}" y="14">${label}</text>\
  <text x="${labelWidth + countWidth / 2}" y="14">${count}</text>\
  </g>\
  </svg>`;
}

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

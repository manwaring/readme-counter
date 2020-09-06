import "source-map-support/register";
import { sns } from "@manwaring/lambda-wrapper";
import fetch from 'node-fetch';
import { Visit, recordVisit, updateCounter } from "./access";

export const handler = sns(async ({ event, success, error }) => {
  try {
    const rawVisit: Visit = JSON.parse(event.Records[0].Sns.Message);
    const visit = await getEnrichedVisit(rawVisit);
    await Promise.all([recordVisit(visit), updateCounter(visit)]);
    return success();
  } catch (err) {
    return error(err);
  }
});

async function getEnrichedVisit(visit: Visit): Promise<Visit> {
  const { status, org } = await getIpInformation(visit.ip);
  if (status?.toUpperCase() === 'SUCCESS') {
    visit.ipLookup = { org }
  }
  return visit;
}

async function getIpInformation(ip: string): Promise<IpApiResponse> {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  return response.json();
}

interface IpApiResponse {
  query: string;
  status: string;
  country: string;
  countryCode: string;
  region: string
  regionName: string;
  city: string;
  zip: string
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

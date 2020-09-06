import "source-map-support/register";
import { wrapper } from "@manwaring/lambda-wrapper";
import fetch from 'node-fetch';
import { Visit, recordVisit, getVisits } from "./access";

export const handler = wrapper(async ({ event, success, error }) => {
  try {
    const visits = await getVisits();
    for (const rawVisit of visits) {
        if (!rawVisit.ipLookup || !rawVisit.ipLookup.city) {
            const visit = await getEnrichedVisit(rawVisit);
            await recordVisit(visit);
        }
    }
    return success();
  } catch (err) {
    return error(err);
  }
});

async function getEnrichedVisit(visit: Visit): Promise<Visit> {
  const { status, org, city, regionName } = await getIpInformation(visit.ip);
  if (status?.toUpperCase() === 'SUCCESS') {
    visit.ipLookup = { org, city, regionName }
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

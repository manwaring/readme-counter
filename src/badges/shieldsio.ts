import * as fetch  from "node-fetch";

export async function getBadgeFromShieldsIO(count: number = 0, link: string, queryString: String): Promise<string> {
  count++; // this current visit likely hasn't been captured yet
  const label = 'Readme%20visits';
  const color = 'brightgreen';
  const additionalProps = queryString ? `&${queryString}` : ``;
  const url = `https://img.shields.io/static/v1?label=${label}&message=${count}&color=${color}&link=${link}${additionalProps}`;
  const res = await fetch(url);
  return res.text();
}
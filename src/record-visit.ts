import "source-map-support/register";
import { sns, SnsSignature } from "@manwaring/lambda-wrapper";
import { RepoVisit } from "./access/repo-visit";
import { RepoCounter } from "./access/repo-counter";

export const handler = sns(async ({ event, success, error }: SnsSignature) => {
  try {
    const visit = JSON.parse(event.Records[0].Sns.Message);
    await RepoVisit.put(visit);
    const counter = {
      organization: visit.organization,
      repository: visit.repository,
      count: { $add: 1 },
    };
    await RepoCounter.update(counter);
    return success();
  } catch (err) {
    return error(err);
  }
});

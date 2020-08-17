import "source-map-support/register";
import { sns } from "@manwaring/lambda-wrapper";
import { Visit, recordVisit, updateCounter } from "./access";

export const handler = sns(async ({ event, success, error }) => {
  try {
    const visit: Visit = JSON.parse(event.Records[0].Sns.Message);
    await Promise.all([recordVisit(visit), updateCounter(visit)]);
    return success();
  } catch (err) {
    return error(err);
  }
});

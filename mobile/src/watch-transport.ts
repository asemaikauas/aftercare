import type { Submission } from "./model";

// Keep local watch types, but use the existing clinic API's supported events.
export function clinicSubmission(item: Submission): Submission {
  if (!item.kind.startsWith("watch-")) return item;
  return {
    ...item,
    kind: item.kind === "watch-checkin" ? "check-in" : "message",
    body:
      item.kind === "watch-alert" ? `HELP REQUEST � ${item.body}` : item.body,
  };
}

import { votingEventContract } from "@community-voting-system/shared";
import { useClient } from "../../common/api";
import { VotingEvent } from "./type";

export const votingEventClient = useClient(votingEventContract)

export async function getVotingEvents(query: VotingEvent['request']['find'] = {}): Promise<VotingEvent['response']['find']> {
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // return fakeData;
  const result = await votingEventClient.find({ query });
  if (result.status === 200) {
    return result.body
  }
  throw new Error('Failed to fetch voting events');
}

export async function getVotingEvent(id: string): Promise<VotingEvent['response']['findOne'] | undefined> {
  const result = await votingEventClient.findOne({
    params: { id },
  });
  if (result.status === 200) {
    return result.body
  }
  return undefined;
}

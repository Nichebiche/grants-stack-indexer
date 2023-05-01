import { Indexer, JsonStorage, Event } from "chainsauce";
import { convertToUSD } from "../../prices/index.js";

export default async function (
  { chainId, storage: db }: Indexer<JsonStorage>,
  event: Event
) {
  const id = event.address;
  const matchAmount = event.args.newAmount.toString();

  const round = await db.collection("rounds").findById(id);

  const amountUSD = await convertToUSD(
    chainId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    round!.token,
    BigInt(matchAmount),
    event.blockNumber
  );

  await db.collection("rounds").updateById(id, (round) => ({
    ...round,
    updatedAtBlock: event.blockNumber,
    matchAmount: matchAmount,
    matchAmountUSD: amountUSD.amount,
  }));
}
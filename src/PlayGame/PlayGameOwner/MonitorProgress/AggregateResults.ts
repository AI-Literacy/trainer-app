import { UserProgress } from "./MonitorProgress";

export default function aggregateResults(
  gid: string, userProgress: {[x: string]: UserProgress}
) {
  let cardRatings: {[cid: string]: (boolean | null | number | undefined)[]} = {};

  Object.values(userProgress)
    .map(p => p.ratings)
    .forEach(rating => {
      Object.keys(rating) // card ids
        .forEach(cid => {
          const r = rating[cid] // rating

          if (!(cid in cardRatings)) cardRatings[cid] = [];
          cardRatings[cid].push(r)
        })
    })
  
  Object.values(cardRatings)
    .forEach(r => {
      for (let i = 0; i < r.length; i++) {
        if (r[i] != null) r[i] = r[i] ? 1 : 0;
      }
    })
  let reducedRatings = cardRatings as { [cid: string]: (number | null)[] };

  let out: { [cid: string]: { ratings: (number | null)[], vote: number } } = {};
  Object.keys(cardRatings)
    .forEach(cid => {
      const votesInFavor = reducedRatings[cid]
        .map(r => r ? 1 : 0 as number)
        .reduce((a, b) => a + b);
      
      const vote = votesInFavor > reducedRatings[cid].length / 2 ? 1 : 0;
      
      out[cid] = {
        ratings: reducedRatings[cid],
        vote
      }
    })

  return out;
}
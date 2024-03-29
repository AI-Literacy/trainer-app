import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadData from "./LoadData";
import Graph from "./Graph";
import DownloadData from "./DownloadData";

interface Results {
  [cid: string]: {
    ratings: (number | null)[],
    vote: number
  }
}

interface Cards {
  [cid: string]: {
    [fid: string]: {
      name: string,
      value: number
    }
  }
}

const Visualize = () => {
  const [data, setData] = useState<any[]>([]);
  const { gid } = useParams();

  useEffect(() => {
    if (!gid) return;

    (async () => {
      const gameRef = await getDoc(doc(getFirestore(), 'games', gid));
      const game: any = gameRef.data();
      const results: Results = game.results;
      
      const cardRef = await getDoc(doc(getFirestore(), 'games', gid, 'private', 'cards'));
      const cards: Cards = cardRef.data() as Cards;

      let newData: any[] = [];
      Object.keys(cards).forEach(cid => {
        let out: {[x: string]: number} = {};
        
        // Add card data
        Object.values(cards[cid]).forEach(
          field => out = {...out, [field.name]: field.value}
        )

        // Add rating
        if (results[cid]) {
          out['Vote'] = results[cid].vote;
          newData.push(out);
        }
      });

      console.log(newData);

      setData(newData);
    })();
  }, [gid]);

  return (
    <div className="w-4/5 mx-auto">
      { gid ? <DownloadData gid={gid} data={data} /> : <LoadData setData={setData} /> }
      {
        data.length === 0
        ? null
        : <Graph data={data} />
      }
    </div>
  );
}

export default Visualize;
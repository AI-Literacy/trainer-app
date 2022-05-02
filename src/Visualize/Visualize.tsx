import { useState } from "react";
import DropCSV from "./DropCSV";
import Graph from "./Graph";

const Visualize = () => {
  const [data, setData] = useState<any[]>([]);

  return (
    <div className="w-4/5 mx-auto">
      <DropCSV setData={setData} />
      {
        data.length === 0
        ? null
        : <Graph data={data} />
      }
    </div>
  );
}

export default Visualize;
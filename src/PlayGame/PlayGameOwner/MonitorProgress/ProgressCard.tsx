import { UserProgress } from "./MonitorProgress";

interface ProgressCardProps {
  data: UserProgress
}

const ProgressCard = ({ data }: ProgressCardProps) => (
  <div className="w-full flex border rounded mt-6 p-3 flex-row">
    <div className="w-1/5 flex flex-col justify-center items-center">
      <img src={data.img} alt="" className="w-20 rounded-full" />
      <p className="text-lg">{data.name}</p>
    </div>
    <div className="w-3/5 flex flex-col justify-center items-center">
      <div className="w-full bg-gray-300 rounded h-8">
        <div 
          className="bg-emerald-500 text-md font-medium h-full text-black p-0.5 leading-none rounded" 
          style={{ width: `${data.cardsRated / data.cardsTotal * 100}%` }}>
            <div className={`h-full w-full flex items-center ${data.cardsRated > 0 ? 'justify-center' : ''}`}>
              {Math.round(100 * data.cardsRated / data.cardsTotal)}%
            </div>
        </div>
      </div>
    </div>
    <div className="w-1/5 flex flex-col justify-center items-center">
      <p className="text-xl text-white">{data.cardsRated} / {data.cardsTotal}</p>
    </div>
  </div>
);

export default ProgressCard;
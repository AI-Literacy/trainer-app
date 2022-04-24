import { Player } from './MonitorUsers';

const PlayerCard = ({ player }: { player: Player }) => {
  const { name, img } = player;
  return (
    <div className="w-1/4 p-3 m-2 rounded border border-white flex flex-row">
      <div className="flex flex-col w-1/4 justify-center align-middle">
        <img src={img} alt="" className="max-w-lg rounded-full" />
      </div>
      <div className="flex flex-col w-3/4 justify-center align-middle">
        <p className="text-xl self-center">{name}</p>
      </div>
    </div>
  )
}

export default PlayerCard;
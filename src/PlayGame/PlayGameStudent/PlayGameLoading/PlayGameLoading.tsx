
import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../../App";
import { addSelfToGame } from "./StudentLoadingUtils";
import { HashLoader } from 'react-spinners';


const PlayGameLoading = () => {
  const { gid } = useParams();
  const user = useContext(UserContext);

  useEffect(() => {
    if (!gid || !user) return;
    addSelfToGame(gid, user);    
  }, [gid, user]);

  return (
    <div className='fixed w-full h-full flex align-center z-50 bg-black bg-opacity-50'>
        <div className="flex w-full h-full justify-center">
            <div className="flex self-center">
                <HashLoader color={'white'} size={150} />
            </div>
        </div>
    </div>
  );
};

export default PlayGameLoading;

import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../../App";
import { addSelfToGame } from "./StudentLoadingUtils";

const PlayGameLoading = () => {
  const { gid } = useParams();
  const user = useContext(UserContext);

  useEffect(() => {
    if (!gid || !user) return;
    addSelfToGame(gid, user);    
  }, [gid, user]);

  return (<p>Loading</p>);
};

export default PlayGameLoading;
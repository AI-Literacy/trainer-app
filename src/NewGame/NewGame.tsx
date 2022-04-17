import { FormEvent, useContext, useEffect, useState } from "react";

import { debounceTime, Subject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuid } from 'uuid';
import { useNavigate } from "react-router-dom";

import { UserContext } from "../App";
import styles from '../App/Form.module.css';
import GameFieldInput from "./GameFieldInput";
import { makeNewGame, validateGameCode } from "./NewGameUtils";
import { GameField } from "./Template";
import LoadTemplateButton from "./LoadTemplateButton";

const gcChange$ = new Subject<string>();

const NewGame = () => {
  const [gameCode, setGameCode] = useState<string>("");
  const [gcFeedback, setGCFeedback] = useState<string>("");
  const [viewsPerCard, setViewsPerCard] = useState<number>(3);
  const [cardsPerPlayer, setCardsPerPlayer] = useState<number>(5);
  const [fields, setFields] = useState<{ [x: string]: GameField }>({
    [uuid()]: { name: '', min: 0, max: 10 }
  });

  // Two subscriptions, to update the state and set feedback
  useEffect(() => {
    const s1 = gcChange$.subscribe(setGameCode);
    const s2 = gcChange$
      .pipe(
        debounceTime(500),
        mergeMap(async (gc: string) => await validateGameCode(gc))
      )
      .subscribe(setGCFeedback);
    
    return () => {
      s1.unsubscribe();
      s2.unsubscribe();
    }
  }, [setGameCode, setGCFeedback])

  const user = useContext(UserContext);
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const success = await makeNewGame(
      { gameCode, viewsPerCard, cardsPerPlayer, fields, started: false }, 
      user!.uid
    );

    if (success) navigate(`/game/${gameCode}`);
  }

  const handleFieldChange = (idx: string) => {
    return (newVal: GameField) => setFields({ 
      ...fields,    // keep the old fields
      [idx]: newVal // update one property
    })
  }

  const addNewField = () => setFields({ 
    ...fields, 
    [uuid()]: { name: '', min: 0, max: 10 }  // reasonable default
  });

  const handleRemoveField = (idx: string) => () => {
    let newFields = Object.assign({}, fields);
    delete newFields[idx];

    setFields(newFields)
  }
  
  return (
    <div className="app w-4/5 mt-8 mx-auto flex flex-row">
      <div className="flex flex-col w-full h-full md:w-1/2">
        <h1 className="text-4xl mb-8">Create a new game</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="game-code">
              <span className="text-gray-200 text-xl">Game code</span>
            </label>
            {
              gcFeedback
              ? <div><span className="text-red-400 text-lg">{gcFeedback}</span></div>
              : null
            }
            <input 
              type="text" 
              className={`
                ${styles["input"]} 
                w-full 
                ${gcFeedback ? styles['error'] : ''}
              `} 
              name="game-code" 
              value={gameCode}
              onChange={(e) => gcChange$.next(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="views-per-card">
              <span className="text-gray-200 text-xl">Number of views per card</span>
            </label>
            <input 
              type="number" 
              className={`${styles["input"]} w-full `} 
              name="views-per-card" 
              value={viewsPerCard}
              onChange={(e) => setViewsPerCard(parseInt(e.target.value))}
              min={1}
              max={100}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="cards-per-player">
              <span className="text-gray-200 text-xl">Number of cards per player</span>
            </label>
            <input 
              type="number" 
              className={`${styles["input"]} w-full `} 
              name="cards-per-player" 
              value={cardsPerPlayer}
              onChange={(e) => setCardsPerPlayer(parseInt(e.target.value))}
              min={1}
              max={10}
            />
          </div>
          {
            Object.entries(fields).map(
              ([idx, val]) => (
                <GameFieldInput
                  key={idx}
                  field={val}
                  setField={handleFieldChange(idx)}
                  deleteSelf={handleRemoveField(idx)}
                />
              )
            )
          }
          <div className="mt-10 relative">
            <LoadTemplateButton loadSample={setFields} />
            <button 
              onClick={addNewField}
              className={`${styles['submit']} mr-2 mb-2`}
            >
              <FontAwesomeIcon icon={faCirclePlus} className="mr-2" /> Add Field
            </button>
            <button 
              onClick={handleSubmit} 
              className={styles['submit']}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      <div className="hidden md:flex md:w-1/2 flex-col justify-start items-end">
        <img className="w-4/5 mb-6 mt-6" style={{ maxWidth: '50%' }} src="/img/new-game.svg" alt="" />
      </div>
    </div>
  );
}

export default NewGame;
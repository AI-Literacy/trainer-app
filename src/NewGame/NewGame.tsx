import { FormEvent, useContext, useState } from "react";

import { debounceTime, Subject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { v4 as uuid } from 'uuid';

import { makeNewGame, validateGameCode } from "./NewGameUtils";
import styles from '../App/Form.module.css';
import GameField, { Field } from "./GameField";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";


const NewGame = () => {
  const gcChange$ = new Subject<string>();
  const [gameCode, setGameCode] = useState<string>("");
  const [gcFeedback, setGCFeedback] = useState<string>("");
  const [viewsPerCard, setViewsPerCard] = useState<number>(3);
  const [cardsPerPlayer, setCardsPerPlayer] = useState<number>(5);
  const [fields, setFields] = useState<{ [x: string]: Field }>({
    [uuid()]: { name: '', min: 0, max: 10 }
  });

  // Two subscriptions, to update the state and set feedback
  gcChange$.subscribe(setGameCode);
  gcChange$
    .pipe(
      debounceTime(500),
      mergeMap(async (gc: string) => await validateGameCode(gc))
    )
    .subscribe(setGCFeedback)


  const user = useContext(UserContext);
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const success = await makeNewGame(
      gameCode, viewsPerCard, cardsPerPlayer, fields, user!.uid
    );

    if (success) navigate(`/game/${gameCode}`);
  }

  const handleFieldChange = (idx: string) => {
    return (newVal: Field) => setFields({ 
      ...fields,    // keep the old fields
      [idx]: newVal // update one property
    })
  }

  const addNewField = () => setFields({ 
    ...fields, 
    [uuid()]: { name: '', min: 0, max: 10 }  // reasonable default
  });

  const loadSample = () => {
    // get option (using DOM?)
    // get fields from firebase 
    // load fields based off option
    return;
  }

  const handleRemoveField = (idx: string) => () => {
    let newFields = Object.assign({}, fields);
    delete newFields[idx];

    setFields(newFields)
  }
  
  /* TODO: fix margins of Load a sample, change default in input*/
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
          <div className="mb-3">
            <select className= {`${styles['select']}`} aria-label="Disabled select example">
                <option disabled selected>Load a sample game</option>
                <option value="sports">Sports</option>
                <option value="music">Music Band</option>
                <option value="project">School Group Project</option>
                <option value="presentation">Team Presentation</option>
            </select>
            <button 
              onClick={loadSample}
              className={`${styles['submit']} mr-4`}
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2" /> Load
            </button>
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
                <GameField
                  key={idx}
                  field={val}
                  setField={handleFieldChange(idx)}
                  deleteSelf={handleRemoveField(idx)}
                />
              )
            )
          }
          <div className="mt-10">
            <button 
              onClick={addNewField}
              className={`${styles['submit']} mr-4`}
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
      <div className="hidden md:flex md:w-1/2 flex-col justify-center items-end">
        <img className="w-4/5 mb-6" style={{ maxHeight: '60%' }} src="/img/new-game.svg" alt="" />
      </div>
    </div>
  );
}

export default NewGame;
import React, { useEffect } from "react";
import { Subject } from "rxjs";

import { GameField } from "../Template";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

import styles from '../../App/Form.module.css';
import gfstyles from './GameFieldInput.module.css';

interface GameFieldProps {
  field: GameField,
  setField: (f: GameField) => void,
  deleteSelf: () => void
}
const valChange$ = new Subject<GameField>();

const GameFieldInput = ({ field, setField, deleteSelf }: GameFieldProps) => {
  useEffect(() => {
    const s = valChange$
      .subscribe(setField);

    return () => s.unsubscribe();
  });

  const generateEmission = (propName: string, prep: (s: string) => any = (s) => s) => 
    (e: React.FormEvent<HTMLInputElement>) => {
      valChange$.next({ ...field, [propName]: prep(e.currentTarget.value) })
    }

  return (
    <div className="mb-4 text-xl border rounded p-3 relative">
      <div className="flex flex-col w-full">
        <p>
          Randomly generate a field titled 
          <input 
            type="text" 
            value={field.name} 
            onChange={generateEmission('name')} 
            className={styles['input-inline']}
          />
          which takes values between
          <input
            type="number"
            value={field.min}
            onChange={generateEmission('min', parseInt)}
            className={`${styles['input-inline']} mt-2`}
          />
          and
          <input
            type="number"
            value={field.max}
            onChange={generateEmission('max', parseInt)}
            className={`${styles['input-inline']} mt-2`}
          />.
        </p>
      </div>
      <button 
        className={`absolute top-0 right-0 ${gfstyles.close}`} 
        onClick={deleteSelf}
        aria-label="delete field"
      >
        <FontAwesomeIcon size={'lg'} icon={faXmarkCircle} />
      </button>
    </div>
  );
};

export default GameFieldInput;
import React, { useEffect } from "react";
import { Subject } from "rxjs";

import { GameField } from "../Template";
import styles from '../../App/Form.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
    <div className="mb-4 text-xl border rounded p-3 flex flex-row">
      <div className="flex flex-col w-full md:w-11/12">
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
      <div className="flex flex-col justify-center w-full md:w-1/12 border-l ">
        <button onClick={deleteSelf}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );
};

export default GameFieldInput;
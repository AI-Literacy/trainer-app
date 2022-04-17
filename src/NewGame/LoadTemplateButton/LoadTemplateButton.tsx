import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

import { GameField } from "../Template";

import styles from '../../App/Form.module.css';
import templateButtonStyles from './LoadTemplateButton.module.css';
import { collection, DocumentData, getDocs, getFirestore, QueryDocumentSnapshot } from "firebase/firestore";

interface LoadTemplateButtonProps {
  loadSample: (sample: { [x: string]: GameField }) => void
}

interface FirebaseTemplate {
  name: string,
  fields: { [x: string]: GameField }
}

const LoadTemplateButton = ({ loadSample }: LoadTemplateButtonProps) => {
  const [templates, setTemplates] = useState<FirebaseTemplate[]>([]);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (templates.length !== 0) return;

    (async () => {
      const db = getFirestore();
      const templateQuery = await getDocs(collection(db, 'templates'));
      
      let templateRefs: QueryDocumentSnapshot<DocumentData>[] = [];
      templateQuery.forEach(d => templateRefs.push(d));

      let newTemplates: FirebaseTemplate[] = [];
      for (const d of templateRefs) {
        let fields = {};
        const fieldsQuery = await getDocs(collection(db, 'templates', d.id, 'fields'));
        fieldsQuery.forEach(f => fields = { ...fields, [f.id]: f.data() });

        newTemplates.push({
          fields,
          ...d.data()
        } as FirebaseTemplate)
      }
      setTemplates(newTemplates);
    })()
  });

  useEffect(() => {
    if (!optionsOpen) return;

    const closeOptionsWindow = () => {
      setOptionsOpen(false);
    }

    window.addEventListener('click', closeOptionsWindow, false);
    return () => window.removeEventListener('click', closeOptionsWindow);
  }, [setOptionsOpen, optionsOpen])

  return (
    <>
      <button
        id="loadTemplate"
        className={`${styles['submit']} mr-2 mb-2`}
        onClick={() => setOptionsOpen(true)}
      >
        Load Template <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
      </button>
      <div 
        id="loadTemplateDropdown" 
        className={`${templateButtonStyles.dropdown} ${ optionsOpen ? '' : 'hidden' }`}
      >
        <ul aria-labelledby="loadTemplate">
          {
            templates.map((t, i) => (
              <li key={`template-${i}`}>
                <button onClick={() => loadSample(t.fields)}>{t.name}</button>
              </li>
            ))
          }
        </ul>
      </div>
    </>
  );
}

export default LoadTemplateButton;
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { 
  collection, 
  DocumentData, 
  getDocs, 
  getFirestore, 
  QueryDocumentSnapshot 
} from "firebase/firestore";

import styles from '../../App/Form.module.css';
import templateButtonStyles from './LoadTemplateButton.module.css';
import TemplatePartial from "./TemplatePartial";

interface LoadTemplateButtonProps {
  loadSample: (sample: TemplatePartial) => void
}

const LoadTemplateButton = ({ loadSample }: LoadTemplateButtonProps) => {
  const [templates, setTemplates] = useState<TemplatePartial[]>([]);
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (templates.length !== 0) return;

    (async () => {
      const db = getFirestore();
      const templateQuery = await getDocs(collection(db, 'templates'));
      
      let templateRefs: QueryDocumentSnapshot<DocumentData>[] = [];
      templateQuery.forEach(d => templateRefs.push(d));

      let newTemplates: TemplatePartial[] = [];
      for (const d of templateRefs) {
        let fields = {};
        const fieldsQuery = await getDocs(collection(db, 'templates', d.id, 'fields'));
        fieldsQuery.forEach(f => fields = { ...fields, [f.id]: f.data() });

        newTemplates.push({
          fields,
          ...d.data()
        } as TemplatePartial)
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
        type='button'
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
                <button type='button' onClick={() => loadSample(t)}>{t.name}</button>
              </li>
            ))
          }
        </ul>
      </div>
    </>
  );
}

export default LoadTemplateButton;
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import Papa from 'papaparse';

import styles from './Visualize.module.css';
import SearchPreviousGames from "./SearchPreviousGames";

interface UploadProps {
  setData: (data: any[]) => void
}


const LoadData = ({ setData }: UploadProps) => {
  const [error, setError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    cardRef.current?.classList.remove('bg-transparent');
    cardRef.current?.classList.add('bg-white');
    cardRef.current?.classList.add('bg-opacity-25');
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    cardRef.current?.classList.remove('bg-white');
    cardRef.current?.classList.remove('bg-opacity-25');
    cardRef.current?.classList.add('bg-transparent');
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragLeave(e);
    setError('');
    
    if (!e.dataTransfer.items) {
      setError("No data selected");
      return;
    }

    if (e.dataTransfer.items.length > 1) {
      setError("Only one file can be uploaded at a time");
      return;
    }

    const file = e.dataTransfer.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length > 0) {
          setError(`${errors.length} errors found. Please check your file.`);
          return;
        }

        if (data.length === 0) {
          setError("No data found in file");
          return;
        }

        setData(data);
      }
    })
  }

  return (
    <>
      <div 
        className={styles.dropCSV} 
        ref={cardRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col w-16 justify-center items-center">
          <FontAwesomeIcon icon={faUpload} size={'4x'} />
        </div>
        <div className="flex flex-col flex-1 items-center">
          <p className="text-4xl">Drop a CSV file here</p>
          <p className="text-4xl mt-4 mb-4">or</p>
          <SearchPreviousGames />
        </div>
      </div>
      { error ? (<p className="text-center text-2xl text-red-500 mt-4">{error}</p>) : null }
    </>
  );
}

export default LoadData;
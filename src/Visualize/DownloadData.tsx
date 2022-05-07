import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Papa from 'papaparse';
import styles from './Visualize.module.css';

const DownloadData = ({ data, gid }: { data: any[], gid: string }) => {
  const downloadData = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${gid}.csv`;
    link.click();
  }

  return (
    <div
      className={styles.downloadCSV}
      role={'button'}
      aria-labelledby={'download-label'}
      onClick={downloadData}
    >
      <div className="flex flex-col w-16 justify-center items-center">
        <FontAwesomeIcon icon={faDownload} size={'4x'} />
      </div>
      <div className="flex flex-col flex-1 items-center">
        <p className="text-4xl" id={'download-label'}>Download the data as a CSV file</p>
      </div>
    </div>
  )
};

export default DownloadData;
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { CiImport } from "react-icons/ci";
import './dragAndDropUploader.scss';
import { importEnvironment } from '../../environments/redux/environmentsActions';
import { importApi } from '../../collections/redux/collectionsActions';


const DragAndDropUploader = ({ onClose, view, importType }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const dispatch = useDispatch();

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
  }, []);

  const handleImport = () => {
    const uploadedFile = new FormData()
    uploadedFile.append('myFile', file, fileName)
    if (importType == 'environment') {
      dispatch(importEnvironment(uploadedFile, onClose))
    }
    if (importType === 'openapi') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const rawData = {
          myFile: content,
          fileName: fileName,
        };
          dispatch(importApi(JSON.parse(rawData.myFile), view, onClose, 'application/json'));
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="drag-and-drop-uploader">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <div className="upload-icon">
          <CiImport size={50} />
        </div>
        <div className="upload-text">
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drop anywhere to import<br />or select <span className="file-link">files</span> or <span className="file-link">folders</span></p>
          )}
        </div>
      </div>
      {fileName && (
        <div className="file-info">
          <p>Selected file: {fileName}</p>
        </div>
      )}
      <button
        onClick={handleImport}
        className="btn btn-primary mt-3"
        disabled={!file}
      >
        Import
      </button>
    </div>
  );
};

export default DragAndDropUploader;

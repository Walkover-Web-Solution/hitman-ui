import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { importEnvironment } from "./redux/environmentsActions"
import { useDispatch } from "react-redux"
import { CiImport } from "react-icons/ci"
import "./dragAndDropUploader.scss"

const DragAndDropUploader = ({ onClose }) => {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState("")
  const dispatch = useDispatch()

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0]
    setFile(uploadedFile)
    setFileName(uploadedFile.name)
  }, [])

  const handleImport = () => {
    const uploadedFile = new FormData()
    uploadedFile.append("myFile", file, fileName)
    dispatch(importEnvironment(uploadedFile, onClose))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className='drag-and-drop-uploader'>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
        <input {...getInputProps()} />
        <div className='upload-icon'>
          <CiImport size={50} />
        </div>
        <div className='upload-text'>
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>
              Drop anywhere to import
              <br />
              or select <span className='file-link'>files</span> or <span className='file-link'>folders</span>
            </p>
          )}
        </div>
      </div>
      {fileName && (
        <div className='file-info'>
          <p>Selected file: {fileName}</p>
        </div>
      )}
      <button onClick={handleImport} className='btn btn-primary mt-3' disabled={!file}>
        Import
      </button>
    </div>
  )
}

export default DragAndDropUploader

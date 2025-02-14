import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onDrop }) => {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false, // Only allow one file at a time
  });

  return (
    <div
      {...getRootProps()}
      className="border border-dashed p-6 rounded-md text-center cursor-pointer"
    >
      <input aria-label="Upload file" {...getInputProps()} />
      {isDragActive ? <p>Drop the file here...</p> : <p>Drag & drop a file here, or click to select</p>}
    </div>
  );
};

export default FileDropzone;

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import Draggable from 'react-draggable';

function App() {
  const [csvData, setCsvData] = useState({ header: [], rows: [] });
  const [columns, setColumns] = useState([]);
  const [filename, setFilename] = useState('');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFilename(file.name);
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        worker: true,
        chunkSize: 1024 * 1024 * 10, // 10MB
        complete: (results) => {
          if (results.meta && results.meta.fields) {
            setColumns(results.meta.fields);
            setCsvData({ header: results.meta.fields, rows: results.data });
          } else {
            console.error('CSV file does not have headers or is empty.');
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  };

  const handleColumnOrderChange = useCallback(
    (newOrder) => {
      setColumns(newOrder);
    },
    [setColumns]
  );

  const handleDrop = (dragIndex, hoverIndex) => {
    const newColumns = [...columns];
    const dragItem = newColumns[dragIndex];
    newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, dragItem);
    handleColumnOrderChange(newColumns);
  };

  const downloadCSV = () => {
    console.log('Download button clicked');
    console.log('Columns order:', columns);
    console.log('CSV Data:', csvData);

    const reorderedData = csvData.rows.map((row) => {
      const reorderedRow = {};
      columns.forEach((column) => {
        reorderedRow[column] = row[column];
      });
      return reorderedRow;
    });

    console.log('Reordered Data:', reorderedData);

    const csv = Papa.unparse({
      fields: columns,
      data: reorderedData,
    });

    console.log('CSV string:', csv);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);
    console.log('Blob created:', blob);
  };

  const handleClick = () => {
    setButtonClicked(true);
    console.log('Button was clicked');
    downloadCSV();
  };

  return (
    <div className="container">
      <h1>CSV Column Reordering Tool</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />

      <div className="drag-container">
        {columns.map((column, index) => (
          <Draggable key={column} index={index} onDrop={handleDrop}>
            <div className="drag-item">{column}</div>
          </Draggable>
        ))}
      </div>

      {csvData.rows.length > 0 && (
        <div>
          <button
            onClick={handleClick}
            style={{ backgroundColor: buttonClicked ? 'green' : '#007bff' }}
          >
            Generate Download Link
          </button>
          {downloadUrl && (
            <a href={downloadUrl} download={`reordered_${filename}`}>
              Download Reordered CSV
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

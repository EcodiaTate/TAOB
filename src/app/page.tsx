import React, { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { pdfjs, Document, Page } from 'react-pdf';

// This worker is required for react-pdf to function
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfFlipbook = () => {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Document 
        file="/taob-site.pdf" 
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <HTMLFlipBook width={500} height={700} showCover={true}>
          {/* Loop through the total number of pages */}
          {[...Array(numPages).keys()].map((pNum) => (
            <div key={pNum} className="shadow-lg">
              <Page 
                pageNumber={pNum + 1} 
                width={500} 
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </Document>
    </div>
  );
};

export default PdfFlipbook;
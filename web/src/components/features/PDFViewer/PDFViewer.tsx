import React, {useState, useEffect} from 'react';
import {Card, Spinner} from 'react-bootstrap';

interface PDFViewerProps {
    pdfFile?: string | null;
    height?: string | number; // optional override
    loading?: boolean;
    error?: string | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({pdfFile, height = "440px", loading = false, error}) => {
    return (
        <Card
            className="bg-tertiary overflow-hidden rounded-3 d-flex align-items-center justify-content-center"
            style={{height: height}}>
            {loading ? (
                <Spinner animation="border" variant="primary" className="text-primary"/>
            ) : error ? (
                <div className="text-center text-danger">{error}</div>
            ) : pdfFile ? (
                <iframe
                    src={pdfFile}
                    title="PDF Viewer"
                    style={{position: 'absolute', width: '100%', height: '100%'}}
                />
            ) : (
                <div className="text-center text-white" style={{color: '#666'}}>
                    No isometric selected.
                </div>
            )}
        </Card>
    );
};

export default PDFViewer;

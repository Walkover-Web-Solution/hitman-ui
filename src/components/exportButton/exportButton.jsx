// ExportButton.js
import React from 'react';
import exportCollectionApi from '../../services/api/colection/exportCollectionApi';

const ExportButton = ({ orgId, collectionId, collectionName }) => {
    const handleExport = async () => {
        try {
            const data = await exportCollectionApi(orgId, collectionId);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${collectionName}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };
    return (
        <button className='h-auto' onClick={handleExport}>Export Collection</button>
    );
};

export default ExportButton;

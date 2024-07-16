import React, { useState } from 'react';
import exportCollectionApi from '../../services/api/colection/exportCollectionApi';
import ExportModal from './exportCollectionModal';

const ExportButton = ({ orgId, collectionId, collectionName }) => {
    const [isModalOpen, setModalOpen] = useState(false)

    const handleExport = async (type) => {
        try {
            const data = await exportCollectionApi(orgId, collectionId, type);
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
        <>
        <button className='h-auto' onClick={() => setModalOpen(true)}>Export Collection</button>
        <ExportModal
        show={isModalOpen}
        onHide={() => setModalOpen(false)}
        title='Select Export Format'
        onExport={(type) => {
          handleExport(type);
          setModalOpen(false);
        }}
      />
    </>
    );
};

export default ExportButton;

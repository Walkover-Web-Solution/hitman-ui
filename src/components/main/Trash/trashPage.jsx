import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import { MdSettingsBackupRestore } from 'react-icons/md';
import moment from 'moment';
import { toast } from 'react-toastify';
import trashImage from '../../../assets/icons/trash.webp';

import { getCurrentOrg } from '../../auth/authServiceV2';
import { getAllDeletedCollections, restoreCollection } from '../../collections/collectionsApiService';
import './trash.scss';

const TrashPage = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const history = useHistory();
  let orgId = getCurrentOrg()?.id;

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const response = await getAllDeletedCollections(orgId);
        setCollections(response?.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [orgId]);

  const handleBack = () => {
    history.push(`/orgs/${orgId}/dashboard/`);
  };

  const handleRestore = async (collectionId, collectionName) => {
    try {
      const data = { name: collectionName, collectionId, deletedAt: null };
      const response = await restoreCollection(orgId, data);
      if (response.success) {
        setCollections(prevCollections => prevCollections.filter(c => c.id !== collectionId));
        toast.success('Collection restored successfully');
      } else {
        throw new Error('Restoration failed');
      }
    } catch (error) {
      toast.error('Failed to restore collection');
    }
  };

  if (isLoading) {
    return (
      <div className='custom-loading-container'>
        <div className='loading-content'>
          <button className='spinner-border' />
          <p className='mt-3'>Loading</p>
        </div>
      </div>
    );
  }

  return (
    <Container>
      <div className="back-to-workspace mb-4 d-flex align-items-center" onClick={handleBack}>
        <BiArrowBack className='mr-2'/>
        <span>Back to workspace</span>
      </div>
      <h3>Trash</h3>
      {collections?.length > 0 ? (
        <>
          <p>Collections you delete will show up here. You can restore them.</p>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Deleted</th>
                <th>Restore</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection, index) => (
                <tr key={collection.id}
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}>
                  <td>{collection.name}</td>
                  <td>{moment(collection.deletedAt).fromNow()}</td>
                  <td className="restore-action">
                    {hoverIndex === index && (
                      <MdSettingsBackupRestore
                        className="react-icon"
                        onClick={() => handleRestore(collection.id, collection.name)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <div className="text-center mt-5">
          <img src={trashImage} alt="Trash" width={180} className='mb-2'/>
          <p>Collections you delete will show up here.</p>
        </div>
      )}
    </Container>
  );
};

export default TrashPage;

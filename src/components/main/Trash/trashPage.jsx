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
  const [hoverIndex, setHoverIndex] = useState(null);
  const history = useHistory();
  const orgId = getCurrentOrg()?.id;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getAllDeletedCollections(orgId);
        if (response) {
          setCollections(response.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    }
    if (orgId) {
      fetchData();
    }
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
      console.error('Error restoring collection:', error);
      toast.error('Failed to restore collection');
    }
  };

  return (
    <Container>
      <div className="back-to-workspace" onClick={handleBack}>
        <BiArrowBack />
        <button className="mb-4">Back to workspace</button>
      </div>
      <h3>Trash</h3>
      {collections.length > 0 ? (
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
          <img src={trashImage} alt="Trash" />
          <p>Your trash is empty.</p>
        </div>
      )}
    </Container>
  );
};

export default TrashPage;

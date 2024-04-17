import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { getCurrentOrg } from '../../auth/authServiceV2';
import { useHistory } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import { getAllDeletedCollections, restoreCollection } from '../../collections/collectionsApiService';
import { MdSettingsBackupRestore } from 'react-icons/md';
import './trash.scss'
import moment from 'moment';
import { toast } from 'react-toastify';
import trashImage from '../../../assets/icons/trash.webp';

const TrashPage = () => {
  const [collections, setCollections] = useState([]);
  const [hoverIndex, setHoverIndex] = useState(null);

  const history = useHistory();
  let orgId = getCurrentOrg()?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllDeletedCollections(orgId)
        if (response) {
          setCollections(response.data); 
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData(); 
  }, [orgId]); 

  const handleBack = () => {
    history.push(`/orgs/${orgId}/dashboard/`);
  }

  const handleRestore = async (collectionId) => {
    try {
      const response = await restoreCollection(collectionId);
      if (response.success) {
        setCollections(collections.filter(c => c.id !== collectionId));
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
     <BiArrowBack/> <button className='mb-4' onClick={handleBack}>Back to workspace</button>
      <h3>Trash</h3>
      {collections.length > 0 ? (
        <>
      <p>Collections you delete will show up here. You can restore them.</p>
        <Table bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Deleted</th>
              <th></th> {/* This is for the action buttons if any */}
            </tr>
          </thead>
          <tbody>
          {collections.map((collection, index) => (
            <tr key={index}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(null)}>
              <td>{collection.name}</td>
              <td>{moment(collection.updatedAt).fromNow()}</td>
              <td className="restore-action">
          {hoverIndex === index && <MdSettingsBackupRestore className="react-icon" onClick={() => handleRestore(collection.id)}/>}
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

import React, { useState, useEffect } from 'react';
import { getCronByCollection, deleteCron, cronStatus } from '../../../services/cronJobs'
import './RunTabs.scss';
import { useNavigate, useParams } from 'react-router';
import IconButtons from '../../common/iconButton'
import { BsThreeDots } from 'react-icons/bs'
import { MdOutlineMotionPhotosPaused } from "react-icons/md";
import { RiDeleteBinLine } from 'react-icons/ri'
import { ReactComponent as Rename } from '../../../assets/icons/renameSign.svg'
import { GrResume } from "react-icons/gr";

const RunTabs = () => {
  const params = useParams();
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('functional');
  const [scheduledRuns, setScheduledRuns] = useState([]);

  useEffect(() => {
    if (activeTab === 'scheduled') {
      const fetchScheduledRuns = async () => {
        const collectionId = params?.collectionId;
        try {
          const data = await getCronByCollection(collectionId);
          setScheduledRuns(data.data);

        } catch (error) {
          console.error('Failed to fetch scheduled runs:', error);
        }
      };

      fetchScheduledRuns();
    }
  }, [activeTab]);

  const deleteCronById = async (cronId) => {
    try {
      await deleteCron(cronId);
    } catch (error) {
      console.error('Failed to fetch scheduled runs:', error);
    }
  };

  const updateCronStatus = async (cronId, status) => {
    try {
      await cronStatus(cronId, status);
    } catch (error) {
      console.error('Failed to fetch scheduled runs:', error);
    }
  };

  const openEditCron = async (cronId) => {
    const collectionId = params?.collectionId
    navigate(`/collection/${collectionId}/cron/${cronId}/edit`);
  };

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab('functional')} className={activeTab === 'functional' ? 'active' : ''}>Manual</button>
        <button onClick={() => setActiveTab('scheduled')} className={activeTab === 'scheduled' ? 'active' : ''}>Scheduled</button>
        <button onClick={() => setActiveTab('webhook')} className={activeTab === 'webhook' ? 'active' : ''}>Webhook</button>
      </div>
      <div className="content">
        {activeTab === 'functional' && (
          <table>
            <tbody>
              Logs feature coming soon...
            </tbody>
          </table>
        )}
        {activeTab === 'scheduled' && (
          <table>
            <thead>
              <tr>
                <th>Upcoming run</th>
                <th>Scheduled</th>
                <th>Environment</th>
              </tr>
            </thead>
            <tbody>
              {scheduledRuns.map(run => (
                <tr key={run?.cron_id}>
                  <td>{run?.cron_expression}</td>
                  <td>{run?.cron_name}</td>
                  <td>{run?.environmentId}</td>
                  <div className='position-relative'>

                    <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                      <IconButtons>
                        <BsThreeDots />
                      </IconButtons>
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      <div className='dropdown-item d-flex align-items-center' onClick={() => updateCronStatus(run?.cron_id, run?.status === 1 ? 0 : 1)}>
                        {run?.status === 1 ? <MdOutlineMotionPhotosPaused /> : <GrResume />}
                        <span className="ml-2">{run?.status === 1 ? 'Pause' : 'Resume'}</span>
                      </div>
                      <div className='dropdown-item d-flex align-items-center' onClick={() => openEditCron(run?.cron_id)}>
                        <Rename /><span className="ml-2">Edit</span>
                      </div>
                      <div
                        className='dropdown-item text-danger d-flex align-items-center'
                        onClick={() => { deleteCronById(run?.cron_id) }}
                      >
                        <RiDeleteBinLine /><span className="ml-2">Delete</span>
                      </div>
                    </div>
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === 'webhook' && (
          <table>
            <tbody>
              Logs feature coming soon...
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RunTabs;
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { getCronByCollection, deleteCron, cronStatus } from '../../../services/cronJobs'
import IconButtons from '../../common/iconButton'
import { BsThreeDots } from 'react-icons/bs'
import { MdOutlineMotionPhotosPaused } from "react-icons/md";
import { RiDeleteBinLine } from 'react-icons/ri'
import { GrResume } from "react-icons/gr";
import './collectionRuns.scss';
import { useSelector } from 'react-redux';
import cronstrue from 'cronstrue';

const CollectionRuns = () => {
  const params = useParams();
  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('functional');
  const { environments } = useSelector((state) => {
    return { environments: state.environment.environments }
  })
  const { data: scheduledRuns = [], isError, error } = useQuery(
    ['scheduledRuns', params.collectionId],
    () => getCronByCollection(params.collectionId),
    {
      enabled: activeTab === 'scheduled',
      staleTime: Infinity
    }
  );

  if (isError) {
    console.error('Failed to fetch scheduled runs:', error);
  }

  const deleteCronById = async (cronId) => {
    try {
      await deleteCron(cronId);
      queryClient.setQueryData(['scheduledRuns', params.collectionId], oldRuns => {
        return oldRuns.filter(run => run.id !== cronId);
      });
    } catch (error) {
      console.error('Failed to fetch scheduled runs:', error);
    }
  };

  const updateCronStatus = async (cronId, status) => {
    try {
      await cronStatus(cronId, status);
      queryClient.setQueryData(['scheduledRuns', params.collectionId], oldRuns => {
        return oldRuns.map(run => {
          if (run.id === cronId) {
            return { ...run, status: status };
          }
          return run; 
        });
      });
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
                <tr key={run.id}>
                 <td> {run.status === 1 ? cronstrue.toString(run.cron_expression) : <MdOutlineMotionPhotosPaused />}</td>
                  <td>{run.cron_name}</td>
                  <td>{environments[run.environmentId]?.name || 'N/A'}</td>
                  <div className='position-relative'>

                    <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                      <IconButtons>
                        <BsThreeDots />
                      </IconButtons>
                    </div>
                    <div className='dropdown-menu dropdown-menu-right'>
                      <div className='dropdown-item d-flex align-items-center' onClick={() => updateCronStatus(run?.id, run?.status === 1 ? 0 : 1)}>
                        {run?.status === 1 ? <MdOutlineMotionPhotosPaused /> : <GrResume />}
                        <span className="ml-2">{run?.status === 1 ? 'Pause' : 'Resume'}</span>
                      </div>
                      <div
                        className='dropdown-item text-danger d-flex align-items-center'
                        onClick={() => { deleteCronById(run?.id) }}
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

export default CollectionRuns;
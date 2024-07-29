import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-bootstrap'
import { getCronByCollection, deleteCron, cronStatus } from '../../../services/cronJobs'
import IconButtons from '../../common/iconButton'
import { BsThreeDots } from 'react-icons/bs'
import { MdOutlineMotionPhotosPaused } from "react-icons/md";
import { RiDeleteBinLine } from 'react-icons/ri'
import { GrResume } from "react-icons/gr";
import './collectionRuns.scss';
import cronstrue from 'cronstrue';
import { HiDocumentReport } from "react-icons/hi";
import { getOrgId } from '../../common/utility';
import { openInNewTab, updateTab } from '../../tabs/redux/tabsActions';
import tabStatusTypes from '../../tabs/tabStatusTypes';
import moment from 'moment'


const CollectionRuns = () => {
  const params = useParams();
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('functional');
  const { environments, automation } = useSelector((state) => {
    return {
      environments: state?.environment?.environments,
      automation: state?.automation
    }
  })
  const { data: scheduledRuns = [], isError, error } = useQuery(
    ['scheduledRuns', params?.collectionId],
    () => getCronByCollection(params.collectionId),
    {
      enabled: activeTab === 'scheduled',
      staleTime: Infinity
    }
  );
  const collectionId = params?.collectionId
  const orgId = getOrgId()

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

  const openEditCron = async (runId) => {
    dispatch(openInNewTab({
      id: runId,
      type: 'manual-runs',
      status: tabStatusTypes.SAVED,
      previewMode: true,
      isModified: false,
      state: {}
    }))
     navigate(`/orgs/${orgId}/dashboard/collection/${collectionId}/runs/${runId}`)
  };

  const navigateToScheduleRuns = () => {
    navigate(`/orgs/${orgId}/dashboard/collection/${collectionId}/runner`);
  }

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
            <thead>
              <tr>
                <th>Start time</th>
                <th>Source</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(automation).filter(([id, runDetails]) => runDetails.collectionId === params.collectionId).map(([id, runDetails]) => (
                <tr key={id}>
                  <td>{moment(runDetails.date).format('MMMM D, YYYY [at] HH:mm:ss')}</td>
                  <td>{'Runner'}</td>
                  <td>{runDetails.responseTime} ms</td>
                  <div className='sidebar-item-action-btn d-flex' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' onClick={() => openEditCron(id)}>
                    <IconButtons>
                      <HiDocumentReport />
                    </IconButtons>
                  </div>
                </tr>
              ))}
            </tbody>
          </table>
        )}
               {activeTab === 'scheduled' && scheduledRuns.length > 0 && (
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
        {activeTab === 'scheduled' && scheduledRuns.length === 0 && (
          <div className='text-center mt-5'>
            <strong>No scheduled runs for this collection.</strong>
            <p>You can schedule runs for this collection to periodically run it at a certain time or frequency on the Techdoc Cloud.</p>
            <Button className='btn btn-primary fs-sm mr-1' onClick={navigateToScheduleRuns}>Schedule Runs</Button>
          </div>
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
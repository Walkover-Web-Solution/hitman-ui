import React, { useState, useEffect } from 'react';
import { getCronByCollection } from '../../../services/cronJobs'; // Adjust the path as necessary
import './RunTabs.scss';
import { useParams } from 'react-router';

const RunTabs = () => {
    const params = useParams();
  const [activeTab, setActiveTab] = useState('functional');
  const [scheduledRuns, setScheduledRuns] = useState([]);

  const runs = [
    { id: 1, date: 'Jul 10, 2024 15:30:52', source: 'Runner', duration: '1s 122ms', tests: 0, passed: 0, failed: 0, skipped: 0, avgRespTime: '63 ms' },
    { id: 2, date: 'Jul 06, 2024 11:46:30', source: 'Runner', duration: '1s 18ms', tests: 0, passed: 0, failed: 0, skipped: 0, avgRespTime: '61 ms' },
    // Add more runs as needed
  ];

  useEffect(() => {
    if (activeTab === 'scheduled') {
      const fetchScheduledRuns = async () => {
        const collectionId = params?.collectionId; // Replace with actual collection ID
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

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveTab('functional')} className={activeTab === 'functional' ? 'active' : ''}>Manual</button>
        <button onClick={() => setActiveTab('scheduled')} className={activeTab === 'scheduled' ? 'active' : ''}>Scheduled</button>
        <button onClick={() => setActiveTab('performance')} className={activeTab === 'performance' ? 'active' : ''}>Webhook</button>
      </div>
      <div className="content">
        {activeTab === 'functional' && (
          <table>
            <thead>
              <tr>
                <th>Start time</th>
                <th>Source</th>
                <th>Duration</th>
                <th>All tests</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th>Avg. Resp. Time</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id}>
                  <td>{run.date}</td>
                  <td>{run.source}</td>
                  <td>{run.duration}</td>
                  <td>{run.tests}</td>
                  <td>{run.passed}</td>
                  <td>{run.failed}</td>
                  <td>{run.skipped}</td>
                  <td>{run.avgRespTime}</td>
                </tr>
              ))}
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
                </tr>
              ))}
            </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

export default RunTabs;
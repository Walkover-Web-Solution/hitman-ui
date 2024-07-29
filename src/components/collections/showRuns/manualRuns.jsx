import React from 'react';
import './manualRuns.scss'; 
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import moment from 'moment'


function ManualRuns() {
  const params = useParams()
  const { automation, activeTabId, collections, pages } = useSelector((state) => {
    return {
      automation: state.automation,
      activeTabId : state.tabs.activeTabId,
      collections : state.collections,
      pages : state.pages
    }
  })
  const collectionId = params?.collectionId
  const averageResponseTime = 1345
  // const averageResponseTime = (automation[activeTabId]?.responseTime)/(automation[activeTabId]?.executionOrder.length || 1);
  
  return (
    <div className="manual-runs-container">
      <h1> {collections[collectionId]?.name} - Run results</h1>
      <div className="run-details">
      <span>Ran on {moment(automation[activeTabId]?.date).format('MMMM D, YYYY [at] HH:mm:ss')}</span>
        <a href="/runs">View all runs</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Environment</th>
            <th>Iterations</th>
            <th>Duration</th>
            <th>All tests</th>
            <th>Avg. Resp. Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Runner</td>
            <td>New Environment</td>
            <td>1</td>
            <td>{automation[activeTabId]?.responseTime}ms</td>
            <td>0</td>
            <td>{averageResponseTime.toFixed(2)} ms</td>
          </tr>
        </tbody>
      </table>
      <div className="test-results">
        <h2>All Tests</h2>
        <div className="iteration-details">
          {automation[activeTabId]?.executionOrder.map(id => (
            <div key={id}>
            <div className="run-details" >
              <span className={`${pages[id]?.requestType} request-type-bgcolor mr-2`}>{pages[id]?.requestType}</span>{pages[id]?.name}
              <span>{automation[activeTabId]?.executedScriptResponses[id]?.requestDuration}</span>
              <span>{automation[activeTabId]?.executedScriptResponses[id]?.status}</span>
            </div>
              <div>{automation[activeTabId]?.executedScriptResponses[id]?.errorMessage}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManualRuns;
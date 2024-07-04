import React from 'react';
import './testResults.scss';

const TestResults = ({ tests }) => {

  const renderTestResult = (testcase, index) => {
    let details = testcase.testName;
    if (!testcase.success) {
      details += ` (${testcase.msg})`;
    }
    return (
      <div key={index} className='test-result-item my-2'>
        <div className={`test-badge ${testcase.status}`}>{testcase.status}</div>
        <span className='name'>{details}</span>
      </div>
    );
  };

  const renderEmpty = () => {
    return (
      <div className='px-3 py-5 text-center'>
        <div>There are no tests for this request.</div>
        <small>Write a test script to automate debugging</small>
      </div>
    );
  };

  return tests.length > 0 ? (
    <div className='test-results-container px-2'>
      {tests.map((test, index) => renderTestResult(test, index))}
    </div>
  ) : (
    renderEmpty()
  );
};

export default TestResults;

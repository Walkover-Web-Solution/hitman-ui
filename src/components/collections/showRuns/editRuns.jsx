import React from 'react'
import { Form } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

const EditRuns = () => {
    const params = useParams()

    const { allPages, collectionName, clientData, currentEnvironmentId, allEnviroments, currentUser, users } = useSelector((state) => {
        return {
            allPages: state.pages,
            collectionName: state.collections?.[params?.collectionId]?.name || 'collection',
            clientData: state.clientData,
            collections: state.collections,
            currentEnvironmentId: state?.environment.currentEnvironmentId,
            allEnviroments: state?.environment?.environments,
            currentUser: state?.users?.currentUser,
            users: state?.users?.usersList
        }
    })

    return (
        <div className='run-automation-container'>
            <div className='endpoints-container'>
                <h3 className='text-left'>Run Automation for {`${collectionName}`}</h3>
                {/* {endpointsIds.length === 0 ? (
          <div className='p-3 d-flex flex-column justify-content-center'>
            <span className='data-message'>No Endpoint has been found...</span>
          </div>
        ) : (
          <div className='p-3 d-flex flex-column'>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='checkbox-container d-flex align-items-center'>
                <span onClick={() => handleSelectAndDeselectAll(true)} className='ml-1 select-all mr-1 cursor-pointer'>
                  Select All
                </span>
                <div className='saperation'></div>
                <span onClick={() => handleSelectAndDeselectAll(false)} className='ml-1 cursor-pointer'>
                  Deselect All
                </span>
              </div>
            </div>
            <div className='mt-1 d-flex flex-column align-items-start justify-content-center'>
              {endpointsIds.map((endpointId) => {
                return (
                  <Form.Check
                    onClick={() => handleChangeEndpointCheckStatus(endpointId)}
                    className='mt-2'
                    type='checkbox'
                    id={endpointId}
                    label={renderEndpointName(endpointId)}
                    checked={clientData?.[endpointId]?.automationCheck || false}
                  />
                )
              })}
            </div>
          </div>
        )} */}
            </div>
            <div className='options-container'>
                    <div>
                        <h5>Schedule Configuration</h5>
                        <span>Your collection will be automatically run on the Techdoc at the configured frequency.</span>
                        <Form.Group>
                            <Form.Label className='muted-text'>Schedule name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter schedule name'
                                // value={scheduleName}
                                // onChange={(e) => setScheduleName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='muted-text'>Run Frequency</Form.Label>
                            <Form.Control as='select' 
                            // value={basicRunFrequency} 
                            // onChange={(e) => setBasicRunFrequency(e.target.value)}
                            >
                                <option>Hourly</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                            </Form.Control>
                        </Form.Group>
                        <div className='d-flex justify-content-between'>
                            <Form.Group className='w-50 pr-2'>
                                <Form.Control as='select' 
                                // value={runFrequency} 
                                // onChange={(e) => setRunFrequency(e.target.value)}
                                >
                                    <option>Every day</option>
                                    <option>Every weekday (Monday-Friday)</option>
                                    <option>Every Monday</option>
                                    <option>Every Tuesday</option>
                                    <option>Every Wednesday</option>
                                    <option>Every Thursday</option>
                                    <option>Every Friday</option>
                                </Form.Control>
                            </Form.Group>
                            <span className='mt-2'>at</span>
                            <Form.Group className='w-50 pl-2'>
                                <Form.Control type='time' 
                                // value={runTime} 
                                // onChange={(e) => setRunTime(e.target.value)}
                                 />
                            </Form.Group>
                        </div>
                        <Form.Group>
                            <Form.Label className='muted-text'>Environment</Form.Label>
                            <Form.Control as='select' 
                            // value={currentEnvironment || ''} onChange={(e) => setCurrentEnvironmentId(e.target.value)}
                            >
                                <option value=''>Select environment</option> // Add this line
                                {/* {allEnviroments &&
                                    Object.keys(allEnviroments).map((envId) => (
                                        <option key={envId} value={envId}>
                                            {allEnviroments[envId].name || 'Unnamed Environment'}
                                        </option>
                                    ))} */}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='muted-text'>Email notifications</Form.Label>
                            <Form.Control type='text' placeholder='Add recipient' 
                            // value={emailInput} onChange={handleEmailInputChange} 
                            />
                        </Form.Group>
                    </div>
            </div>
        </div>
    )
}

export default EditRuns;


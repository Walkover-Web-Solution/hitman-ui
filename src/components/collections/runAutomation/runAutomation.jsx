import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Form } from 'react-bootstrap';
import { IoIosPlay } from "react-icons/io";
import { updateEndpointCheckStatus, updateAllEndpointCheckStatus } from '../../../store/clientData/clientDataActions';
import { toast } from 'react-toastify';
import { runAutomation } from '../../../services/generalApiService';
import './runAutomation.scss';
import { addCron, addWebhook } from '../../../services/cronJobs';
import { generateCronExpression } from '../../common/utility';
import { RiAiGenerate } from "react-icons/ri";
import { FaRegCopy } from "react-icons/fa6";

export default function RunAutomation() {

    const userEmail = JSON.parse(localStorage.getItem('profile'))?.email || 'email not found';
    const dispatch = useDispatch();
    const params = useParams();

    const { allPages, collectionName, clientData, currentEnvironmentId, allEnviroments, currentUser, users } = useSelector((state) => {
        return {
            allPages: state.pages,
            collectionName: state.collections?.[params?.collectionId]?.name || 'collection',
            clientData: state.clientData,
            collections: state.collections,
            currentEnvironmentId: state?.environment.currentEnvironmentId,
            allEnviroments: state?.environment?.environments,
            currentUser: state?.users?.currentUser,
            users: state?.users?.usersList,
        }
    })

    const [endpointsIds, setEndpiontsIds] = useState([]);
    const [automationLoading, setAutomationLoading] = useState(false);
    const [runType, setRunType] = useState('manual');
    const [scheduleName, setScheduleName] = useState('');
    const [runFrequency, setRunFrequency] = useState('Every day');
    const [runTime, setRunTime] = useState('12:00');
    const [currentEnvironment, setCurrentEnvironmentId] = useState('');
    const [emailInput, setEmailInput] = useState([]);
    const [basicRunFrequency, setBasicRunFrequency] = useState('Daily');
    const [webhookResponse, setWebhookResponse] = useState('');
    const [tokenGenerationInProgress, setTokenGenerationInProgress] = useState(false);
    useEffect(() => {
        filterEndpointsOfCollection();
        if (runType !== 'webhook') {
            setTokenGenerationInProgress(false);
        }
    }, [params?.collectionId]);

    const filterEndpointsOfCollection = () => {
        const endpointsIds = Object.keys(allPages).reduce((acc, pageId) => {
            if (allPages[pageId]?.collectionId === params?.collectionId && allPages[pageId].protocolType === 1) acc.push(pageId);
            return acc;
        }, []);
        setEndpiontsIds(endpointsIds);
    }

    const renderEndpointName = (endpointId) => {
        return (
            <div className='d-flex justify-content-center align-items-center'>
                <span className={`api-label ${allPages?.[endpointId]?.requestType} request-type-bgcolor mr-2`}>{allPages?.[endpointId]?.requestType}</span>
                <span>{allPages?.[endpointId]?.name || 'Endpoint'}</span>
            </div>
        )
    }

    const handleEmailInputChange = (e) => {
        const inputValue = e.target.value;
        const lastChar = inputValue[inputValue.length - 1];
        const emailsArray = inputValue.split(',').map(email => email.trim());
        setEmailInput(emailsArray);
    };

    const handleSelectAndDeselectAll = (isSelectAll) => {
        dispatch(updateAllEndpointCheckStatus({ isSelectAll, endpointsIds }));
    }

    const handleChangeEndpointCheckStatus = (endpointId) => {
        dispatch(updateEndpointCheckStatus({ id: endpointId, check: !clientData?.[endpointId]?.automationCheck }));
    }

    const filterSelectedEndpointIds = () => {
        return endpointsIds.reduce((acc, endpointId) => {
            if (clientData?.[endpointId]?.automationCheck === true) acc[endpointId] = allPages?.[endpointId]?.name;
            return acc;
        }, {});
    }

    const filterSelectedEndpointIdsArray = () => {
        return endpointsIds.filter(endpointId => clientData?.[endpointId]?.automationCheck === true);
    }

    const organizeSelectedEnv = () => {
        if (!currentEnvironmentId) return;
        let arrangedEnv = {};
        Object.keys(allEnviroments?.[currentEnvironmentId]?.variables || {}).forEach((envKey) => {
            arrangedEnv[envKey] = allEnviroments[currentEnvironmentId]?.variables?.[envKey]?.currentValue || '';
        })
        return arrangedEnv;
    }

    const handleRunAutomation = async () => {
        const filteredEndpointIds = filterSelectedEndpointIds();
        if (Object.keys(filteredEndpointIds).length === 0) return toast.warn('Please select endpoints');
        if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoint to run the automation');
        const organizedEnv = organizeSelectedEnv();
        setAutomationLoading(true)
        try {
            const responseData = await runAutomation({
                endpointIds: filteredEndpointIds,
                collectionId: params?.collectionId,
                userEmail,
                collectionName,
                environments: organizedEnv,
                runType
            });
            if (responseData.status === 200) {
                setAutomationLoading(false)
                return toast.success('Automation ran successfully!')
            }
        }
        catch (error) {
            console.error(error);
            setAutomationLoading(false);
            return toast.error('Error occurred while running automation');
        }
    }

    const handleScheduleRun = async () => {
        const filteredEndpointIds = filterSelectedEndpointIdsArray();
        if (Object.keys(filteredEndpointIds).length === 0) return toast.warn('Please select endpoints');
        if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoint to run the automation');
        const cronExpression = generateCronExpression(basicRunFrequency, runFrequency, runTime);
        const cronSchedulerData = {
            collectionId: params?.collectionId,
            cron_name: scheduleName,
            cron_expression: cronExpression,
            description: "",
            environmentId: currentEnvironment,
            emails: emailInput,
            endpointIds: filteredEndpointIds,
            status: 1
        };
        setAutomationLoading(true)
        try {
            const responseData = await addCron(cronSchedulerData);
            if (responseData.status === 201) {
                setAutomationLoading(false)
                return toast.success('Scheduled successfully!')
            }
        }
        catch (error) {
            console.error(error);
            setAutomationLoading(false);
            return toast.error('Error occurred while scheduling');
        }
    }
    const generateToken = async () => {
        const filteredEndpointIds = filterSelectedEndpointIdsArray();
        if (Object.keys(filteredEndpointIds).length === 0) return toast.warn('Please select endpoints');
        if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoint to run the automation');
        const inputString = {
            collectionId: params?.collectionId,
            environmentId: currentEnvironment,
            emails: emailInput,
            endpointIds: filteredEndpointIds
        };
        setAutomationLoading(true)
        setTokenGenerationInProgress(true); 
        try {
            const responseData = await addWebhook(inputString);
            if (responseData.status === 200) {
                setAutomationLoading(false)
                setWebhookResponse(responseData.data.response);
            }
        }
        catch (error) {
            console.error(error);
            setAutomationLoading(false);
            return toast.error('Error occurred while generating token');
        }
    }

    return (
        <div className='run-automation-container'>
            <div className='endpoints-container'>
                <h3 className='text-left'>Run Automation for {`${collectionName}`}</h3>
                {endpointsIds.length === 0 ?
                    <div className='p-3 d-flex flex-column justify-content-center'>
                        <span className='data-message'>No Endpoint has been found...</span>
                    </div>
                    :
                    <div className='p-3 d-flex flex-column'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='checkbox-container d-flex align-items-center'>
                                <span onClick={() => handleSelectAndDeselectAll(true)} className='ml-1 select-all mr-1 cursor-pointer'>Select All</span>
                                <div className='saperation'></div>
                                <span onClick={() => handleSelectAndDeselectAll(false)} className='ml-1 cursor-pointer'>Deselect All</span>
                            </div>
                        </div>
                        <div className='mt-1 d-flex flex-column align-items-start justify-content-center'>
                            {endpointsIds.map((endpointId) => {
                                return <Form.Check
                                    onClick={() => handleChangeEndpointCheckStatus(endpointId)}
                                    className='mt-2'
                                    type='checkbox'
                                    id={endpointId}
                                    label={renderEndpointName(endpointId)}
                                    checked={clientData?.[endpointId]?.automationCheck || false}
                                />
                            })}
                        </div>
                    </div>}
            </div>
            <div className='options-container'>
                <h5>Choose how to run your collection</h5>
                <Form.Group className='muted-text'>
                    <Form.Check
                        key={`manual-${runType}`}
                        type='radio'
                        label='Run manually'
                        name='runType'
                        id='manual'
                        checked={runType === 'manual'}
                        onChange={() => setRunType('manual')}
                    />
                    <Form.Check
                        key={`schedule-${runType}`}
                        type='radio'
                        label='Schedule runs'
                        name='runType'
                        id='schedule'
                        checked={runType === 'schedule'}
                        onChange={() => setRunType('schedule')}
                    />
                    <Form.Check
                        key={`webhook-${runType}`}
                        type='radio'
                        label='Automate runs via webhook'
                        name='runType'
                        id='webhook'
                        checked={runType === 'webhook'}
                        onChange={() => setRunType('webhook')}
                    />
                </Form.Group>

                {runType === 'schedule' && (
                    <div>
                        <h5>Schedule Configuration</h5>
                        <span>Your collection will be automatically run on the Techdoc at the configured frequency.</span>
                        <Form.Group>
                            <Form.Label className='muted-text'>Schedule name</Form.Label>
                            <Form.Control type="text" placeholder="Enter schedule name" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='muted-text'>Run Frequency</Form.Label>
                            <Form.Control as="select" value={basicRunFrequency} onChange={(e) => setBasicRunFrequency(e.target.value)}>
                                <option>Hourly</option>
                                <option>Daily</option>
                                <option>Weekly</option>
                            </Form.Control>
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            <Form.Group className="w-50 pr-2">
                                <Form.Control as="select" value={runFrequency} onChange={(e) => setRunFrequency(e.target.value)}>
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
                            <Form.Group className="w-50 pl-2">
                                <Form.Control type="time" value={runTime} onChange={(e) => setRunTime(e.target.value)} />
                            </Form.Group>
                        </div>
                        <Form.Group>
                            <Form.Label className='muted-text'>Environment</Form.Label>
                            <Form.Control as="select" value={currentEnvironment || ""} onChange={(e) => setCurrentEnvironmentId(e.target.value)}>
                                <option value="">Select environment</option> // Add this line
                                {allEnviroments && Object.keys(allEnviroments).map(envId => (
                                    <option key={envId} value={envId}>
                                        {allEnviroments[envId].name || "Unnamed Environment"}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='muted-text'>Email notifications</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Add recipient"
                                value={emailInput}
                                onChange={handleEmailInputChange}
                            />
                        </Form.Group>
                    </div>
                )}
                {runType === 'webhook' && (
                    <div>
                        <h5>Webhook Configuration</h5>
                        <span>Automate using webhook</span>
                        <Form.Group>
                            <Form.Label className='muted-text'>Environment</Form.Label>
                            <Form.Control as="select" value={currentEnvironment || ""} onChange={(e) => setCurrentEnvironmentId(e.target.value)}>
                                <option value="">Select environment</option> // Add this line
                                {allEnviroments && Object.keys(allEnviroments).map(envId => (
                                    <option key={envId} value={envId}>
                                        {allEnviroments[envId].name || "Unnamed Environment"}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='muted-text'>Email notifications</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Add recipient"
                                value={emailInput}
                                onChange={handleEmailInputChange}
                            />
                        </Form.Group>
                        {webhookResponse && (
                            <div>
                                <Form.Group>
                                    <Form.Label className='muted-text'>Generated Token</Form.Label>
                                    <div className="d-flex">
                                        <Form.Control type="text" readOnly value={webhookResponse} />
                                        <button className="btn btn-outline-secondary ml-2" onClick={() => navigator.clipboard.writeText(webhookResponse)}><FaRegCopy /></button>
                                    </div>
                                    <span style={{ color: 'red' }}>Make sure to copy your personal access token now as you will not be able to see this again.</span>
                                </Form.Group>
                            </div>
                        )}
                    </div>
                )}
                {runType === 'manual' ?
                    (automationLoading ?
                        <button className='btn btn-primary btn-sm fs-4 d-flex justify-content-center align-items-center'>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span className='ml-1'>Running...</span>
                        </button>
                        :
                        <button onClick={handleRunAutomation} className='btn btn-primary btn-sm fs-4 d-flex justify-content-center align-items-center'>
                            <IoIosPlay className='mr-1' />
                            <span>Run</span>
                        </button>
                    )
                    : runType === 'schedule' ?
                        <button onClick={handleScheduleRun} className='btn btn-primary btn-sm fs-4 d-flex justify-content-center align-items-center'>
                            <IoIosPlay className='mr-1' />
                            <span>Schedule Run</span>
                        </button>
                        :
                        <button onClick={generateToken} disabled={tokenGenerationInProgress} className='btn btn-primary btn-sm fs-4 d-flex justify-content-center align-items-center'>
                            <RiAiGenerate className='mr-1' />
                            <span>Generate Token</span>
                        </button>
                }
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Modal } from 'react-bootstrap';
import { IoIosPlay } from "react-icons/io";
import { updateEndpointCheckStatus, updateAllEndpointCheckStatus } from '../../../store/clientData/clientDataActions';
import { toast } from 'react-toastify';
import { runAutomation } from '../../../services/generalApiService';
import './runAutomation.scss'

export default function RunAutomation() {

    const userEmail = JSON.parse(localStorage.getItem('profile'))?.email || 'email not found';

    const dispatch = useDispatch();
    const params = useParams();

    const { allPages, collectionName, clientData, currentEnvironmentId, allEnviroments } = useSelector((state) => {
        return {
            allPages: state.pages,
            collectionName: state.collections?.[params?.collectionId]?.name || 'collection',
            clientData: state.clientData,
            collections: state.collections,
            currentEnvironmentId: state?.environment.currentEnvironmentId,
            allEnviroments: state?.environment?.environments,
        }
    })

    const [endpointsIds, setEndpiontsIds] = useState([])
    const [automationLoading, setAutomationLoading] = useState(false)

    useEffect(() => {
        filterEndpointsOfCollection()
    }, [params?.collectionId])

    const filterEndpointsOfCollection = () => {
        const endpointsIds = Object.keys(allPages).reduce((acc, pageId) => {
            if (allPages[pageId]?.collectionId === params?.collectionId && allPages[pageId].protocolType === 1) acc.push(pageId);
            return acc;
        }, []);
        setEndpiontsIds(endpointsIds)
    }

    const renderEndpointName = (endpointId) => {
        return (
            <div className='d-flex justify-content-center align-items-center'>
                <span className={`api-label ${allPages?.[endpointId]?.requestType} request-type-bgcolor mr-2`}>{allPages?.[endpointId]?.requestType}</span>
                <span>{allPages?.[endpointId]?.name || 'Endpoint'}</span>
            </div>
        )
    }

    const handleSelectAndDeselectAll = (isSelectAll) => {
        dispatch(updateAllEndpointCheckStatus({ isSelectAll, endpointsIds }))
    }

    const handleChangeEndpointCheckStatus = (endpointId) => {
        dispatch(updateEndpointCheckStatus({ id: endpointId, check: !clientData?.[endpointId]?.automationCheck }))
    }

    const filterSelectedEndpointIds = () => {
        return endpointsIds.reduce((acc, endpointId) => {
            if (clientData?.[endpointId]?.automationCheck === true) acc.push(endpointId)
            return acc;
        }, []);
    }

    const organizeSelectedEnv = () => {
        if (!currentEnvironmentId) return;
        let arrangedEnv = {}
        Object.keys(allEnviroments[currentEnvironmentId]?.variables).forEach((envKey) => {
            arrangedEnv[envKey] = allEnviroments[currentEnvironmentId]?.variables?.[envKey]?.currentValue || '';
        })
        return arrangedEnv;
    }

    const handleRunAutomation = async () => {
        const filteredEndpointIds = filterSelectedEndpointIds();
        if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoints to run the automation')
        const organizedEnv = organizeSelectedEnv();
        setAutomationLoading(true)
        try {
            const responseData = await runAutomation({ endpointIds: filteredEndpointIds, collectionId: params?.collectionId, userEmail, collectionName, environments: organizedEnv })
            if (responseData.status === 200) {
                setAutomationLoading(false)
                return toast.success('Automation ran successfuly!')
            }
        }
        catch (error) {
            console.error(error);
            setAutomationLoading(false)
            return toast.error('Error occured on running automation')
        }
    }

    return (
        <div className='d-flex flex-column align-items-start pt-3 pl-5 pr-5'>
            {endpointsIds.length === 0 ?
                <div className='p-3 d-flex flex-column justify-content-center'>
                    <span className='data-message'>No Endpoint has been found...</span>
                </div>
                :
                <div className='p-3 d-flex flex-column'>
                    <h3 className='text-center'>Run Automation for {`${collectionName}`}</h3>
                    <div className='d-flex flex-column justify-content-between mt-3'>
                        <div className='d-flex align-items-center justify-content-between'>
                            <div className='checkbox-container d-flex align-items-center'>
                                <span onClick={() => handleSelectAndDeselectAll(true)} className='ml-1 select-all mr-1 cursor-pointer'>Select All</span>
                                <div className='saperation'></div>
                                <span onClick={() => handleSelectAndDeselectAll(false)} className='ml-1 cursor-pointer'>Deselect All</span>
                            </div>
                            <div className='d-flex justify-content-end'>
                                {automationLoading ?
                                    <button className='btn btn-primary btn-sm fs-4 mt-2 d-flex justify-content-center align-items-center'>
                                        <span size="sm" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        <span className='ml-1'>Running...</span>
                                    </button>
                                    :
                                    <button onClick={handleRunAutomation} className='btn btn-primary btn-sm fs-4 mt-2 d-flex justify-content-center align-items-center'>
                                        <IoIosPlay className='mr-1' />
                                        <span>Run</span>
                                    </button>
                                }
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
                    </div>
                </div>}
        </div>
    );
}
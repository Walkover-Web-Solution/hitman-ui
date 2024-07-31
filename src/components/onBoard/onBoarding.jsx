import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Form } from 'react-bootstrap';
import './onBoarding.scss'
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineApi } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import InputGroup from 'react-bootstrap/InputGroup'
import { toast } from 'react-toastify';
import { closeAllTabs } from '../tabs/redux/tabsActions'
import { createOrg } from '../../services/orgApiService'
import { onHistoryRemoved } from '../history/redux/historyAction'
import { addCollection } from '../collections/redux/collectionsActions';
import { addPage } from '../pages/redux/pagesActions';

const OnBoarding = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate() 
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isContinueEnabled, setIsContinueEnabled] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [orgName, setOrgName] = useState('')
    const tabs = useSelector((state) => state.tabs)
    const historySnapshot = useSelector((state) => state.history)
    const [isContinue, setIsContinue] = useState(true);

    const handleCardClick = (index) => {
        setSelectedIndex(index);
        setIsContinueEnabled(true);
    };

    const handleContinueClick = () => {
        if (isContinue) {
            setShowInput(true);
            setIsInputVisible(true);
            setIsContinue(false);
        } else {
            setShowInput(false);
            setIsInputVisible(false);
            setIsContinue(true);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAddOrg()
        }
    }

    const handleAddOrg = async (selectedIndex) => {
        try {
            if (!validateName(orgName)) {
                toast.error('Invalid organization name')
                return
            }
            await handleNewOrgClick(selectedIndex)
        } catch (e) {
            toast.error('Something went wrong')
        }
    }

    const handleNewOrgClick = async (selectedIndex) => {
        const tabIdsToClose = tabs.tabsOrder;
        if (tabIdsToClose.length <= 1) {
            removeFromLocalStorage(tabIdsToClose);
            dispatch(closeAllTabs(tabIdsToClose));
            dispatch(onHistoryRemoved(historySnapshot));
            await createOrg(orgName, selectedIndex, false);
            const collection = await createUntitledCollection(); 
            const rootParentId = collection?.rootParentId
            await createUntitledPage(rootParentId);

        }
    };

    const createUntitledCollection = async () => {
        const newCollection = { name: 'untitled' };
        try {
            const actionResult = await dispatch(addCollection(newCollection));
            return actionResult; 
        } catch (error) {
            console.error("Error creating collection:", error);
            throw error; 
        }
    };
    
    const createUntitledPage = async (rootParentId) => {
        const newPage = { name: 'untitled', pageType: 1};
        try {
        await dispatch(addPage(navigate, rootParentId, newPage));
        } catch (error) {
            console.error("Error creating page:", error);
            throw error; 
        }
    };
    const removeFromLocalStorage = (tabIds) => {
        tabIds.forEach((key) => {
            localStorage.removeItem(key)
        })
    }

    const validateName = (orgName) => {
        const regex = /^[a-zA-Z0-9_]+$/
        return orgName && regex.test(orgName) && orgName.length >= 3 && orgName.length <= 50
    }

    return (
        <div className="onboarding-container position-relative d-flex flex-column align-items-center justify-content-center overflow-hidden">
            <div className={`on-boarding d-flex flex-column align-items-center justify-content-center p-2 w-100 ${showInput ? 'slide-out' : ''}`}>
                <h2 className='mb-5'>
                    How do you want to use techdoc?
                </h2>
                <div className='card-container d-flex flex-column flex-sm-row'>
                    {['Light', 'Light'].map((variant, index) => (
                        <div key={index} className='d-flex flex-column align-items-center justify-content-center'>
                            <Card
                                bg={variant.toLowerCase()}
                                text={variant.toLowerCase() === 'light' ? 'dark' : 'white'}
                                className={`card-main cursor-pointer ${selectedIndex === index ? 'active-tab bg-white' : ''}`}
                                onClick={() => handleCardClick(index)}
                            >
                                <Card.Body>
                                    <Card.Text className={`card-text d-flex flex-column justify-content-center align-items-center h-100 ${selectedIndex === index ? 'text-black' : 'text-black-50'}`}>
                                        {index === 0 ? (
                                            <div className='d-flex flex-column align-items-center'>
                                                <IoDocumentTextOutline size={40} />
                                                <div className='mt-3'>Use Documentation</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className='d-flex align-items-center'>
                                                    <IoDocumentTextOutline size={40} />
                                                    <FaPlus size={16} className='mx-2' />
                                                    <MdOutlineApi className='ml-1' size={40} />
                                                </div>
                                                <div className='mt-3'>Use Documentation with API</div>
                                            </>
                                        )}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                            <Form.Check
                                className='mt-2'
                                aria-label={`option ${index + 1}`}
                                name="radio-group"
                                checked={selectedIndex === index}
                                onChange={() => handleCardClick(index)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className={`input-container position-absolute d-flex align-items-center flex-column p-2 w-100 ${showInput ? 'show-in' : ''}`}>
                {isInputVisible && (
                    <div className='input-group'>
                        <InputGroup className='mb-3'>
                            <Form.Control
                                className='rounded'
                                placeholder='Enter Organization Name'
                                type='text'
                                aria-label='Organization name'
                                aria-describedby='basic-addon2'
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                onKeyDown={(e) => {
                                    handleKeyPress(e)
                                }}
                                isInvalid={orgName && !validateName(orgName)}
                            />
                            <Button className='ml-2' onClick={() => { handleAddOrg(selectedIndex) }} variant='outline-secondary' id='button-addon2'>
                                Create
                            </Button>
                        </InputGroup>
                        <div className='d-flex'>
                            <small className='muted-text'>**Organization name accepts min 3 and max 50 characters</small>
                        </div>
                    </div>
                )}
            </div>
            <Button
                variant="secondary"
                className='btn-Continue btn-btn-lg px-5 mt-5'
                disabled={!isContinueEnabled}
                onClick={handleContinueClick}
            >
                {isContinue ? 'Continue' : 'Back'}
            </Button>
        </div>

    )
}

export default OnBoarding
import React, { useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap';
import './onBoarding.scss'
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineApi } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import InputGroup from 'react-bootstrap/InputGroup'
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { closeAllTabs } from '../tabs/redux/tabsActions'
import { createOrg } from '../../services/orgApiService'
import { onHistoryRemoved } from '../history/redux/historyAction'

const OnBoarding = () => {
    const dispatch = useDispatch()

    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isContinueEnabled, setIsContinueEnabled] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [orgName, setOrgName] = useState('')
    const tabs = useSelector((state) => state.tabs)
    const historySnapshot = useSelector((state) => state.history)

    const handleCardClick = (index) => {
        setSelectedIndex(index);
        setIsContinueEnabled(true);
    };

    const handleContinueClick = () => {
        setShowInput(true);
        setTimeout(() => {
            setIsInputVisible(true);
        }, 500);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAddOrg()
        }
    }

    const handleAddOrg = async () => {
        try {
            if (!validateName(orgName)) {
                toast.error('Invalid organization name')
                return
            }
            await handleNewOrgClick()
        } catch (e) {
            toast.error('Something went wrong')
        }
    }

    const handleNewOrgClick = async () => {
        const tabIdsToClose = tabs.tabsOrder
        if (tabIdsToClose.length === 1 || tabIdsToClose.length === 0) {
            removeFromLocalStorage(tabIdsToClose)
            dispatch(closeAllTabs(tabIdsToClose))
            dispatch(onHistoryRemoved(historySnapshot))
            await createOrg(orgName)
        }
    }

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
        <div className="onboarding-container">
            <div className={`on-boarding d-flex flex-column align-items-center justify-content-center ${showInput ? 'slide-out' : ''}`}>
                <h2 className='mb-5'>
                    How do you want to use techdoc?
                </h2>
                <div className='d-flex'>
                    {[
                        'Light',
                        'Light'
                    ].map((variant, index) => (
                        <div key={index} className='mr-2 d-flex flex-column align-items-center justify-content-cente'>
                            <Card
                                bg={variant.toLowerCase()}
                                text={variant.toLowerCase() === 'light' ? 'dark' : 'white'}
                                className={`card-main cursor-pointer ${selectedIndex === index ? 'active-tab' : ''}`}
                                onClick={() => handleCardClick(index)}
                            >
                                <Card.Body>
                                    <Card.Text className='d-flex flex-column justify-content-center align-items-center'>
                                        {index === 0 ? (
                                            <IoDocumentTextOutline size={40} />
                                        ) : (
                                            <>
                                                <div className='d-flex align-items-center'>
                                                    <IoDocumentTextOutline size={40} />
                                                    <FaPlus size={16} />
                                                    <MdOutlineApi className='ml-1' size={40} />
                                                </div>
                                            </>
                                        )}

                                        {index === 0 ? 'Documentation' : 'Documentation & page'}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                            <Form.Check
                                type="radio"
                                aria-label={`radio ${index + 1}`}
                                name="radio-group"
                                checked={selectedIndex === index}
                                onChange={() => handleCardClick(index)}
                            />
                        </div>
                    ))}
                </div>
                <button
                    className='btn btn-primary mt-3'
                    disabled={!isContinueEnabled}
                    onClick={() => { handleContinueClick() }}
                >
                    Continue
                </button>
            </div>
            <div className={`input-container ${showInput ? 'visible' : ''}`}>
                {isInputVisible && (
                    <>
                        <InputGroup className='mb-3'>
                            <Form.Control
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
                            <Button onClick={() => { handleAddOrg() }} variant='outline-secondary' id='button-addon2'>
                                Create
                            </Button>
                        </InputGroup>
                        <div className='d-flex'>
                            <small className='muted-text'>**Organization name accepts min 3 and max 50 characters</small>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default OnBoarding
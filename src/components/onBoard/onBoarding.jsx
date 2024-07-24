import React, { useState } from 'react'
import { Card, Form } from 'react-bootstrap';
import './onBoarding.scss'
import { IoDocumentTextOutline } from "react-icons/io5";
import { MdOutlineApi } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

const OnBoarding = () => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleCardClick = (index) => {
        setSelectedIndex(index);
    };
    return (
        <div className='on-boarding d-flex flex-column align-items-center justify-content-center'>
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
                            onChange={() => handleCardClick(index)} // This ensures that the radio button updates when clicked
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OnBoarding
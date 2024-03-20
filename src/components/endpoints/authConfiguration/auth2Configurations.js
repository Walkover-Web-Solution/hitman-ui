import React, { useState } from 'react'
import TokenGenerator from '../newTokenGenerator'

const authResponses = []

export default function Auth2Configurations(props) {

    const [showTokenGenerator, setShowTokenGenerator] = useState(false);

    const handleGenerateToken = () => {
        setShowTokenGenerator(!showTokenGenerator)
    }

    return (
        <>
            <div className='authorization-editor-wrapper'>
                <form>
                    <div className='input-field-wrapper form-group d-block mb-1'>
                        <div>
                            <label className='basic-auth-label'>Access Token</label>
                        </div>
                        <div className='basic-auth-input'>
                            <input name='accessToken' className='form-control' />
                            <div className='dropdown available-token-dropdown ml-2'>
                                <button className='btn dropdown-toggle' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' >
                                    Availabale Tokens
                                </button>
                                <div className='dropdown-menu available-token-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                                    {authResponses.map((response, index) => (
                                        <button key={index} type='button' className='dropdown-item' >
                                            {response.tokenName}
                                        </button>
                                    ))}
                                    <button type='button' className='dropdown-item' >
                                        {authResponses.length !== 0 ? 'Manage Tokens' : 'No Tokens Available'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='input-field-wrapper d-block'>
                        <div className='basic-auth-label' />
                        <div className='basic-auth-input'>
                            <button className='btn btn-outline orange' type='button' onClick={handleGenerateToken} >
                                Get New Access Token
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <TokenGenerator onHide={handleGenerateToken} show={showTokenGenerator} title='Get new access token' {...props} />
        </>
    )
}

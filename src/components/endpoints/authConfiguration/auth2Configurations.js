import React, { useEffect, useState } from 'react'
import TokenGenerator from '../newTokenGenerator'
import { useSelector } from 'react-redux'
import AccessTokenManager from '../displayTokenManager'
import { addAuthorizationDataTypes } from '../../common/authorizationEnums'
import './auth2Configurations.scss'

export default function Auth2Configurations(props) {

    const { tokenDetails } = useSelector((state) => {
        return { tokenDetails: state.tokenData.tokenDetails || {} }
    })

    const [showTokenGenerator, setShowTokenGenerator] = useState(false);
    const [openManageTokenModel, setOpenManageTokenModel] = useState(false);
    const [selectedTokenId, setSelectedTokenId] = useState(null);
    const [selectedTokenValue, setSelectedTokenValue] = useState(tokenDetails?.[selectedTokenId]?.accessToken || '');

    useEffect(() => {
        addAccessTokenInsideHeadersAndParams(selectedTokenValue)
    }, [props?.addAuthorizationDataToForAuth2])


    const handleGenerateToken = () => {
        setShowTokenGenerator(!showTokenGenerator)
    }

    const handleManageTokenClick = () => {
        setOpenManageTokenModel(!openManageTokenModel)
    }

    const handleSelectToken = (tokenId) => {
        setSelectedTokenValue(tokenDetails?.[tokenId]?.accessToken || '')
        setSelectedTokenId(tokenId)
        addAccessTokenInsideHeadersAndParams(tokenDetails?.[tokenId]?.accessToken)
    }

    const handleTokenValueChange = (e) => {
        setSelectedTokenValue(e.target.value)
        addAccessTokenInsideHeadersAndParams(e.target.value)
    }

    const addAccessTokenInsideHeadersAndParams = (value) => {
        if (props?.addAuthorizationDataToForAuth2 === addAuthorizationDataTypes.requestHeaders) {
            props.set_authorization_headers(value, 'Authorization.oauth_2')
        }
        else if (props?.addAuthorizationDataToForAuth2 === addAuthorizationDataTypes.requestUrl) {
            props.set_authoriztaion_params(value, 'access_token')
        }
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
                            <input onChange={handleTokenValueChange} value={selectedTokenValue} name='accessToken' className='form-control' />
                            <div className='dropdown available-token-dropdown ml-2'>
                                <button className='btn dropdown-toggle' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' >
                                    {selectedTokenId ? tokenDetails[selectedTokenId]?.tokenName : 'Availabale Tokens'}
                                </button>
                                <div className='dropdown-menu available-token-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                                    {Object.keys(tokenDetails).map((tokenId, index) => (
                                        <button onClick={() => handleSelectToken(tokenId)} key={index} type='button' className='dropdown-item' >
                                            {tokenDetails[tokenId].tokenName}
                                        </button>
                                    ))}
                                    {Object.keys(tokenDetails).length !== 0 ?
                                        <button onClick={handleManageTokenClick} type='button' className='dropdown-item manage-token-title' >
                                            Manage Tokens
                                        </button> :
                                        <button type='button' className='dropdown-item' >
                                            No Tokens Available
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='input-field-wrapper d-block'>
                        <div className='basic-auth-input'>
                            <button className='btn btn-outline orange' type='button' onClick={handleGenerateToken} >
                                Get New Access Token
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            {openManageTokenModel === true && <AccessTokenManager show onHide={handleManageTokenClick} />}
            <TokenGenerator onHide={handleGenerateToken} show={showTokenGenerator} title='Get new access token' {...props} />
        </>
    )
}
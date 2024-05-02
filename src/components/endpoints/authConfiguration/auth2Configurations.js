import React, { useState } from 'react'
import TokenGenerator from '../newTokenGenerator'
import { useSelector } from 'react-redux'
import AccessTokenManager from '../displayTokenManager'
import './auth2Configurations.scss'

export default function Auth2Configurations(props) {

    const { tokenDetails } = useSelector((state) => {
        return {
            tokenDetails: state.tokenData.tokenDetails || {}
        }
    })

    const [showTokenGenerator, setShowTokenGenerator] = useState(false);
    const [openManageTokenModel, setOpenManageTokenModel] = useState(false);

    const handleGenerateToken = () => {
        setShowTokenGenerator(!showTokenGenerator)
    }

    const handleManageTokenClick = () => {
        setOpenManageTokenModel(!openManageTokenModel)
    }

    const handleSelectToken = (tokenId) => {
        props.setSelectedTokenValue(tokenDetails?.[tokenId]?.accessToken || '')
        props.setSelectedTokenId(tokenId)
        props.addAccessTokenInsideHeadersAndParams(tokenDetails?.[tokenId]?.accessToken, tokenId)
    }

    const handleTokenValueChange = (e) => {
        props.setSelectedTokenValue(e.target.value)
        props.addAccessTokenInsideHeadersAndParams(e.target.value)
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
                            <input onChange={handleTokenValueChange} value={props?.selectedTokenValue ?? ''} name='accessToken' className='form-control' />
                            <div className='dropdown available-token-dropdown ml-2'>
                                <button className='btn dropdown-toggle' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' >
                                    {props?.selectedTokenId && tokenDetails[props?.selectedTokenId]?.tokenName ? tokenDetails[props?.selectedTokenId]?.tokenName : 'Available Tokens'}
                                </button>
                                <div className='dropdown-menu dropdown-menu-token available-token-dropdown-menu' aria-labelledby='dropdownMenuButton'>
                                    {Object.keys(tokenDetails).map((tokenId, index) => (
                                        <button onClick={() => handleSelectToken(tokenId)} key={index} type='button' className='dropdown-item dropdown-token-item fs-4 d-block' >
                                            {tokenDetails[tokenId].tokenName}
                                        </button>
                                    ))}
                                    {Object.keys(tokenDetails).length !== 0 ?
                                        <button onClick={handleManageTokenClick} type='button' className='dropdown-item manage-token-title fs-4 d-block' >
                                            Manage Tokens
                                        </button> :
                                        <button type='button' className='dropdown-item p-1 fs-4' >
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
            {openManageTokenModel === true &&
                <AccessTokenManager
                    show
                    onHide={handleManageTokenClick}
                    addAccessTokenInsideHeadersAndParams={props?.addAccessTokenInsideHeadersAndParams}
                    setSelectedTokenId={props?.setSelectedTokenId}
                    setSelectedTokenValue={props?.setSelectedTokenValue}
                />
            }
            {showTokenGenerator && <TokenGenerator
                {...props}
                onHide={handleGenerateToken}
                show={showTokenGenerator}
                title='Get new access token'
            />}
        </>
    )
}
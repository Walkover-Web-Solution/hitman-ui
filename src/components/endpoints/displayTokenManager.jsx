import React, { useState } from 'react'
import { Modal, ListGroup, Row, Col } from 'react-bootstrap'
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux'
import { deleteToken } from '../../store/tokenData/tokenDataActions';
import './endpoints.scss'

function AccessTokenManager(props) {
  const { tokenDetails } = useSelector((state) => {
    return {
      tokenDetails: state?.tokenData?.tokenDetails || {},
    }
  })

  const dispatch = useDispatch();

  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const handleTokenClick = (tokenId) => {
    setSelectedTokenId(tokenId)
  }

  const handleDeleteTokenClick = (e, tokenId) => {
    e.stopPropagation()
    dispatch(deleteToken({ tokenId }));
  }

  const handleUseTokenClick = () => {
    props.setSelectedTokenId(selectedTokenId);
    props.setSelectedTokenValue(tokenDetails?.[selectedTokenId]?.accessToken);
    props.onHide();
  }

  return (
    <Modal onHide={props?.onHide} show={props?.show} id='modal-display-token' size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>Manage Access Tokens</Modal.Title>
      </Modal.Header>
      <Row className='p-0 m-0 content-container'>
        <Col className='m-0 p-0' id='code-window-sidebar' sm={3}>
          <ListGroup>
            <p className='ml-3 mt-2 heading-token'>All Tokens</p>
            {Object.keys(tokenDetails).map((tokenId, index) => (
              <div onClick={() => handleTokenClick(tokenId)} className={`token-name-container ${selectedTokenId === tokenId && 'selected-token-state'}`} key={index}>
                <ListGroup.Item className='tokens-list-item ml-2 d-flex justify-content-between align-items-center'>
                  <p className='token-name'>{tokenDetails[tokenId].tokenName}</p>
                  <MdDelete onClick={(e) => handleDeleteTokenClick(e, tokenId)} className='delete-token-icon' size={14} />
                </ListGroup.Item>
              </div>
            ))}
          </ListGroup>
        </Col>
        <Col className='mt-2 mb-2 token-details-field-container' sm={9}>
          {selectedTokenId && <div>
            <div>
              <div className='d-flex justify-content-between align-items-center'>
                <h6 className=''>Token Details</h6>
                <button onClick={handleUseTokenClick} className='oauth2-token-details-list-item-button' type='button'>
                  Use Token
                </button>
              </div>
            </div>
            <TokenDetailsComponent tokenDetails={tokenDetails} selectedTokenId={selectedTokenId} />
          </div>}
        </Col>
      </Row>
    </Modal>
  )
}

function TokenDetailsComponent({ tokenDetails, selectedTokenId }) {
  return (
    <div className='h-100 mt-3'>
      {Object.keys(tokenDetails?.[selectedTokenId] ?? {})?.map((key) => {
        return (
          <div className='d-flex justify-content-center align-items-center mt-1'>
            <div className='token-keys-container'>
              <span>{key}</span>
            </div>
            <textarea disabled value={tokenDetails[selectedTokenId][key] ?? ''} className='token-value-container'></textarea>
          </div>
        )
      })}
    </div>
  )
}

export default AccessTokenManager

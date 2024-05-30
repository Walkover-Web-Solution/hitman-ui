import React, { useState, useEffect, useRef } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { isDashboardRoute, SESSION_STORAGE_KEY } from '../common/utility'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router'
import http from '../../services/httpService'
import { BiLike, BiDislike } from "react-icons/bi";
import './apiDocReview.scss'

const LIKE = 'like'
const DISLIKE = 'dislike'

const ApiDocReview = (props) => {
  const [parentId, setParentId] = useState('')
  const [parentType, setParentType] = useState('')
  const [vote, setVote] = useState(null)
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [feedbackSaved, setFeedbackSaved] = useState(false)
  const [currentReviews, setCurrentReviews] = useState({})

  const prevProps = useRef(props)

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  useEffect(() => {
    setParent()
    setLocalStorageReviews()
  }, [])

  useEffect(() => {
    if (prevProps.current.match.params !== props.match.params) {
      setParent()
    }
    prevProps.current = props
  }, [props.match.params])

  const setLocalStorageReviews = () => {
    try {
      setCurrentReviews(JSON.parse(window.localStorage.getItem('review')) || {})
    } catch {
      setCurrentReviews({})
    }
  }

  const setParent = () => {
    const { pageId, endpointId } = props.match.params || {}
    const parentId = endpointId || pageId
    const parentType = endpointId ? 'endpoint' : 'page'
    setParentId(parentId)
    setParentType(parentType)
  }

  const handleFeedback = (type) => {
    console.log(`Feedback given: ${type}`)
    setFeedbackGiven(true)
    setFeedbackType(type)
  }

  const savelocalstorage = (key, value) => {
    let objList = {}
    try {
      objList = JSON.parse(window.localStorage.getItem('review')) || {}
    } catch {
      objList = {}
    }
    objList[key] = value
    setCurrentReviews(objList)
    window.localStorage.setItem('review', JSON.stringify(objList))
  }
  const handleDislike = () => {
    const feedback = {
      parentId: parentId,
      parentType: parentType,
      email: email,
      vote: getVoteValue(LIKE),
      comment: comment
    }
    const apiUrl = process.env.REACT_APP_API_URL
    const pageId = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    http
      .post(apiUrl + `/feedback/negative`,{pageId, comment})
      .then((response) => {
        console.log(response)
        setFeedbackSaved(true)
        setEmail(response.email)
        setComment(response.comment)
        setVote(null)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const handleLikeButton = () => {
    const feedback = {
      parentId: parentId,
      parentType: parentType,
      email: email,
      vote: getVoteValue(LIKE),
      comment: comment
    }
    const apiUrl = process.env.REACT_APP_API_URL
    const pageId = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    http
      .post(apiUrl + `/feedback/positive`,{pageId})
      .then((response) => {
        console.log(response)
        savelocalstorage(parentId, getVoteKey(vote))
        setEmail('')
        setComment('')
        setVote(null)
        setFeedbackGiven(true)
        setFeedbackType('LIKE')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const getVoteValue = (value) => {
    return value === LIKE ? 1 : -1
  }

  const getVoteKey = (value) => {
    return value === 1 ? LIKE : DISLIKE
  }

  const handleInput = (event) => {
    event.preventDefault()
    const { name, value } = event.target
    if (name === 'email') setEmail(value)
    else if (name === 'comment') setComment(value)
  }

  const renderFeedbackResponse = () => {
    if (feedbackSaved || feedbackType === 'LIKE') {
      return <p className='feedback-saved'>Your feedback has been saved. Thank you!</p>
    } else if (feedbackType === 'DISLIKE') {
      return (
        <div className='d-flex justify-content-end'>
        <div className='feedback-popup'>
          <div className='feedback-content'>
            <div className='d-flex feedback-header justify-content-between'>
              <span className='feedback-title'>Sorry to hear that. What can we do better?</span>
              <button
                className='close-button border-0 bg-white'
                onClick={() => {
                  setFeedbackGiven(false)
                  setFeedbackType('')
                  setFeedbackSaved(false)
                }}
              >
                X
              </button>
            </div>
            <div className='feedback-body'>
              <form>
                <div className='form-group mb-0'>
                  <label>Email</label>
                  <input
                    className='form-control'
                    placeholder='Enter email'
                    onChange={handleInput}
                    value={email}
                    type='email'
                    name='email'
                  />
                </div>
                <div className='form-group mt-3'>
                  <label>Comment</label>
                  <textarea
                    className='form-control'
                    onChange={handleInput}
                    value={comment}
                    type='text'
                    name='comment'
                    placeholder='Enter comment'
                    required
                  />
                </div>
                <div className='d-flex justify-content-end'>
                <Button variant='primary' onClick={handleDislike} disabled={!comment.trim()} className='feedback-button btn-sm fs-4 float-none'>
                  Send
                </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </div>
      )
    }
  }
  return (
    !isDashboardRoute(props) && (
      <>
       
        <div>
          <p className='d-flex justify-content-center'style={{ fontSize: '0.8rem', color:"gray", fontWeight:'500' }}>Was this page helpful?</p>
          <div className='d-flex justify-content-center' style={{ gap: '20px', fontSize: '1.1rem', color:"#adadad" }}>
          <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='like-tooltip'>Helpful</Tooltip>}
            >
            
            <div
              className='cursor-pointer'
              onClick={() => {
                handleLikeButton()
              }}
            >
              <BiLike />
            </div>
            </OverlayTrigger>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip id='dislike-tooltip'>Not helpful</Tooltip>}
            >
            <div
              className='cursor-pointer'
              onClick={() => {
                handleFeedback('DISLIKE')
              }}
            >
              <BiDislike />
            </div>
            </OverlayTrigger>
          </div>
          {feedbackGiven && renderFeedbackResponse()}
        </div>
         {/* )}  */}

       
      </>
    )
  )
}

export default ApiDocReview

import React from 'react'
import { isStateReject, isStateApproved } from '../common/utility'

export function ApproveRejectEntity(props) {
  const { entity, entityId, entityName } = props
  return (
    <span>
      <button
        className='ml-2 btn btn-outline orange'
        type='button'
        onClick={() => (entityName === 'endpoint' ? props.approve_endpoint(entity[entityId]) : props.approve_page(entity[entityId]))}
      >
        Approve
      </button>
      <button
        className='ml-2 btn btn-outline orange'
        type='button'
        onClick={() => (entityName === 'endpoint' ? props.reject_endpoint(entity[entityId]) : props.reject_page(entity[entityId]))}
      >
        Reject
      </button>
    </span>
  )
}

export function PublishEntityButton(props) {
  const { entity, entityId, publishLoader, entityName } = props
  const approvedOrRejected = isStateApproved(entityId, entity) || isStateReject(entityId, entity)
  return (
    <button
      className={
        'ml-2 ' + (publishLoader ? 'btn buttonLoader btn-secondary outline ml-2 orange btn-sm fs-4' : 'btn btn-secondary outline ml-2 orange btn-sm fs-4 mt-1')
      }
      type='button'
      onClick={() => props.open_publish_confirmation_modal()}
      disabled={approvedOrRejected}
    >
      Publish {entityName}
    </button>
  )
}

export function UnPublishEntityButton(props) {
  const { publishLoader, entityName, onUnpublish } = props
  const handleClick = () => {
    if (onUnpublish) {
      onUnpublish()
    } else {
      props.open_unpublish_confirmation_modal()
    }
  }
  return (
    <button
      className={
        'ml-2 ' + (publishLoader ? 'btn buttonLoader btn-secondary outline ml-2 orange btn-sm fs-4' : 'btn btn-secondary outline ml-2 orange btn-sm fs-4 mt-1')
      }
      type='button'
      onClick={handleClick}
    >
      UnPublish {entityName}
    </button>
  )
}

export default {
  ApproveRejectEntity,
  PublishEntityButton,
  UnPublishEntityButton
}

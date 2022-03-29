import React from 'react'
import { isStateApproved } from '../common/utility'

export function ApproveRejectEntity (props) {
  const { entity, entityId, entityName } = props
  return (
    <span>
      <button
        className='ml-2 btn btn-outline orange'
        type='button'
        onClick={() => entityName === 'endpoint' ? props.approve_endpoint(entity[entityId]) : props.approve_page(entity[entityId])}
      >
        Approve
      </button>
      <button
        className='ml-2 btn btn-outline orange'
        type='button'
        onClick={() => entityName === 'endpoint' ? props.reject_endpoint(entity[entityId]) : props.reject_page(entity[entityId])}
      >
        Reject
      </button>
    </span>
  )
}

export function PublishEntityButton (props) {
  const { entity, entityId, publishLoader, entityName } = props
  return (
    <button
      className={'ml-2 ' + (publishLoader ? 'btn btn-outline orange buttonLoader' : 'btn btn-outline orange')}
      type='button'
      onClick={() => props.open_publish_confirmation_modal()}
      disabled={isStateApproved(entityId, entity)}
    >
      Publish {entityName}
    </button>
  )
}
export default {
  ApproveRejectEntity,
  PublishEntityButton
}

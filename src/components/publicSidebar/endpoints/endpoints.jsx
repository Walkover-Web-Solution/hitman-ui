import React from 'react'
import Combination from '../combination/combination'

export default function Endpoints({ endpointId, pages }) {
  return (
    <div className='documnet-container'>
      <span>{pages[endpointId]?.name}</span>
      <div className='pl-2'>
        <Combination incomingPageId={endpointId} pages={pages} />
      </div>
    </div>
  )
}
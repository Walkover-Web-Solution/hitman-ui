import React from 'react'
import Combination from '../combination/combination'

export default function Documents({ docId, pages }) {
  return (
    <div className='documnet-container'>
      <span>{pages[docId]?.name}</span>
      <div className='pl-2'>
        <Combination incomingPageId={docId} pages={pages} />
      </div>
    </div>
  )
}
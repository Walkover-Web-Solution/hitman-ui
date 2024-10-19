'use client'
import React, { useState } from 'react'
import { MdPlayArrow } from "react-icons/md";
import Combination from '../combination/combination'
import Link from 'next/link';
import IconButton from '../../common/iconButton'

export default function Documents({ docId, pages }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleLinkClick = () => setIsExpanded(!isExpanded);
  return (
    <div className='documnet-container'>
      <Link scroll={false} onClick={handleLinkClick} href={``} className="flex justify-content-start align-items-center custom-link-style m-1 p-1">
        <IconButton className='mt-1' variant="sm">
          <MdPlayArrow />
        </IconButton>
        <span className='ml-2 inline-block'>{pages[docId]?.name}</span>
      </Link>
      {isExpanded && <div className='pl-2'>
        <Combination incomingPageId={docId} pages={pages} />
      </div>}
    </div>
  )
}
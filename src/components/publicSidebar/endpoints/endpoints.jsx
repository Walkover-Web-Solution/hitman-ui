"use client"
import React, { useState } from 'react'
import { MdPlayArrow } from "react-icons/md";
import Combination from '../combination/combination'
import IconButton from '../../common/iconButton'
import { getUrlPathById, isTechdocOwnDomain } from '@/components/common/utility';
import { useRouter } from 'next/navigation';
import './endpoints.scss'

export default function Endpoints({ endpointId, pages }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const router = useRouter();

  const handleLinkClick = () => {
    let pathName = getUrlPathById(endpointId, pages)
    pathName = isTechdocOwnDomain() ? `/p/${pathName}` : pathSlug ? `/${pathSlug}/${pathName}` : `/${pathName}`
    if (isExpanded) {
      router.push(pathName);
      return;
    }
    setIsExpanded(!isExpanded);
    router.push(pathName);
  }

  const toggleDoc = () => {
    setIsExpanded(!isExpanded);
  }

  return (
    <div className='endpoint-container'>
      <div scroll={false} href={``} className="d-flex justify-content-start align-items-center custom-link-style my-1 cursor-pointer">
        <IconButton onClick={toggleDoc} variant="sm">
          <MdPlayArrow className='public-arrow-icon' />
        </IconButton>
        <div className='ml-2' onClick={handleLinkClick}>
          <span className='inline-block'>{pages[endpointId]?.name}</span>
          <span className={`ml-1 ${pages[endpointId]?.requestType}`}>{pages[endpointId]?.requestType}</span>
        </div>
      </div>
      <div className='pl-2'>
        <Combination incomingPageId={endpointId} pages={pages} />
      </div>
    </div>
  )
}
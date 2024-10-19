'use client'
import React, { useEffect, useState } from 'react'
import { MdPlayArrow } from "react-icons/md";
import Combination from '../combination/combination'
import Link from 'next/link';
import IconButton from '../../common/iconButton'
import { getUrlPathById, isTechdocOwnDomain } from '@/components/common/utility';
import { useRouter } from 'next/navigation';

export default function Documents({ docId, pages }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const router = useRouter();  

  const handleLinkClick = () => {
    let pathName = getUrlPathById(docId, pages)
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
    <div className='documnet-container'>
      <div scroll={false} className="flex justify-content-start align-items-start custom-link-style m-1 cursor-pointer">
        <IconButton onClick={toggleDoc} className='mt-1' variant="sm">
          <MdPlayArrow />
        </IconButton>
        <span onClick={handleLinkClick} className='ml-2 inline-block'>{pages[docId]?.name}</span>
      </div>
      {isExpanded && <div className='pl-2'>
        <Combination incomingPageId={docId} pages={pages} />
      </div>}
    </div>
  )
}
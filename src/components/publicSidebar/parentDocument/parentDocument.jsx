'use client'
import React, { useState, useEffect } from 'react'
import { MdPlayArrow } from "react-icons/md";
import Combination from '../combination/combination'
import IconButton from '../../common/iconButton'
import { getUrlPathById, isTechdocOwnDomain } from '@/components/common/utility';
import { useRouter } from 'next/navigation';
import './parentDocument.scss'

function ShowVersionDropdown({ docId, pages, selectedVersionId, setSelectedVersionId }) {
  if (pages?.[docId]?.child?.length == 1) return null;

  const versionIdsHasPublishedPages = getVersionIdsWhichHasPublishedPages();

  function getVersionIdsWhichHasPublishedPages() {
    const versionIds = pages?.[docId]?.child;
    return versionIds.map((versionId) => {
      if (pages[versionId]?.child?.length > 0) return versionId;
    })
  }

  return (
    <div class="dropdown">
      <div class="dropdown-toggle version-dropdown-selected-name" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        {pages[selectedVersionId]?.name}
      </div>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        {versionIdsHasPublishedPages.map((versionId) => {
          return <a onClick={() => setSelectedVersionId(versionId)} class="dropdown-item">{pages?.[versionId]?.name}</a>
        })}
      </div>
    </div>
  )
}

export default function ParentDocument({ docId, pages }) {

  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedVersionId, setSelectedVersionId] = useState(getDefaultVersionId());
  const [selectedPage, setSelectedPage] = useState(null)

  const router = useRouter();

  useEffect(() => {
    setSelectedPage(sessionStorage.getItem('currentPublishIdToShow'))
  }, [])


  const handleLinkClick = () => {
    sessionStorage.setItem('currentPublishIdToShow', docId)
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

  function getDefaultVersionId() {
    const versionIds = pages[docId]?.child;
    for (let versionId of versionIds) {
      if (pages[versionId].state == 1) return versionId;
    }
    return null;
  }

  return (
    <div className='documnet-container'>
      <div className="d-flex justify-content-start align-items-center custom-link-style my-1 parent-doc-container">
        <div className={pages[docId]?.child?.length === 0 ? "visibility-hidden" : ''}>
          <IconButton onClick={toggleDoc} variant="sm">
            <MdPlayArrow />
          </IconButton>
        </div>
        <span onClick={handleLinkClick} className={'ml-2 cursor-pointer inline-block' + ' ' + (selectedPage == docId ? 'show-doc-bold' : '')}>{pages[docId]?.name}</span>
        <div className="show-version-dropdown ml-3">
          <ShowVersionDropdown docId={docId} pages={pages} selectedVersionId={selectedVersionId} setSelectedVersionId={setSelectedVersionId} />
        </div>
      </div>
      {isExpanded && <div className='pl-2'>
        <Combination incomingPageId={selectedVersionId ? selectedVersionId : getDefaultVersionId()} pages={pages} />
      </div>}
    </div>
  )
}
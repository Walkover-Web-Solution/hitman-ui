'use client'
import React, { useEffect, useState } from 'react'
import { MdPlayArrow } from "react-icons/md";
import Combination from '../combination/combination'
import IconButton from '../../common/iconButton'
import { getUrlPathById, isTechdocOwnDomain } from '@/components/common/utility';
import { useRouter } from 'next/navigation';
import './subDocument.scss'

export default function SubDocument({ subDocId, pages }) {

    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedSubDoc, setSelectedSubDoc] = useState(null);

    const router = useRouter();

    useEffect(() => {
        setSelectedSubDoc(sessionStorage.getItem('currentPublishIdToShow'))
    }, [])

    const handleLinkClick = () => {
        sessionStorage.setItem('currentPublishIdToShow', subDocId);
        let pathName = getUrlPathById(subDocId, pages)
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
            <div className="d-flex justify-content-start align-items-center custom-link-style my-1">
                <div className={pages[subDocId]?.child?.length === 0 ? "visibility-hidden" : ''}>
                    <IconButton onClick={toggleDoc} variant="sm">
                        <MdPlayArrow />
                    </IconButton>
                </div>
                <span onClick={handleLinkClick} className={'ml-2 cursor-pointer inline-block' + ' ' + (selectedSubDoc == subDocId ? 'show-subdoc-bold' : '')}>{pages[subDocId]?.name}</span>
            </div>
            {isExpanded && <div className='pl-2'>
                <Combination incomingPageId={subDocId} pages={pages} />
            </div>}
        </div>
    )
}

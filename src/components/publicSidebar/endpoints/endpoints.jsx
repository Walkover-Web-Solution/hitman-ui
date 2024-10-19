import React from 'react'
import { MdPlayArrow } from "react-icons/md";
import Combination from '../combination/combination'
import Link from 'next/link';
import IconButton from '../../common/iconButton'
import './endpoints.scss'

export default function Endpoints({ endpointId, pages }) {
  return (
    <div className='endpoint-container'>
      <Link scroll={false} href={``} className="flex justify-content-start align-items-center custom-link-style m-1 p-1">
        <IconButton variant="sm">
          <MdPlayArrow />
        </IconButton>
        <span className='ml-2 inline-block'>{pages[endpointId]?.name}</span>
        <span className={` ml-2 ${pages[endpointId]?.requestType}`}>{pages[endpointId]?.requestType}</span>
      </Link>
      <div className='pl-2'>
        <Combination incomingPageId={endpointId} pages={pages} />
      </div>
    </div>
  )
}
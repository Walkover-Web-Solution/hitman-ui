import React from 'react'
import { isOnPublishedPage, SESSION_STORAGE_KEY } from '../../components/common/utility'
import RenderPageContent from '../../components/pages/renderPageContent'
import DisplayUserAndModifiedData from '../../components/common/userService'
import { useSelector } from 'react-redux'
import { getPublishedContentByIdAndType } from '../../services/generalApiService'
import { useQuery } from 'react-query'
import { IoDocumentTextOutline } from 'react-icons/io5'
import Footer from '../../components/main/Footer'
import '../../components/pages/page.scss'

const queryConfig = {
    refetchOnWindowFocus: false,
    cacheTime: 5000000,
    enabled: true,
    staleTime: 600000, retry: 2
}

function PublicPage() {
    let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)

    const { pages, users } = useSelector((state) => ({
        pages: state.pages,
        users: state.users,
    }))

    const getPagePublishedData = async () => {
        const data = await getPublishedContentByIdAndType(currentIdToShow, pages?.[currentIdToShow]?.type)
        return data;
    }

    let { data } = useQuery(['pageContent', currentIdToShow], getPagePublishedData, queryConfig)

    return (
        <div className={'page-wrapper pt-3'}>
            {data && <h1 className='page-header'>{pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name}</h1>}
            {data ? (
                <div className='pageText'>
                    <RenderPageContent pageContent={data} />
                    <span className='mt-2 Modified-at d-inline-block'>
                        <DisplayUserAndModifiedData isOnPublishedPage={isOnPublishedPage()} pages={pages} currentPage={currentIdToShow} users={users.usersList} />
                    </span>
                </div>
            ) : (
                <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page'>
                    <IoDocumentTextOutline size={140} color='gray' />
                    <span className='empty-line'>
                        {pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name} is empty
                    </span>
                    <span className='mt-1 d-inline-block Modified-at fs-4'>
                        <DisplayUserAndModifiedData isOnPublishedPage={isOnPublishedPage()} pages={pages} currentPage={currentIdToShow} users={users.usersList} />
                    </span>
                </div>
            )}
            <Footer />
        </div>
    )
}

export default PublicPage
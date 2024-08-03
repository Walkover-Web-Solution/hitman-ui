import React from 'react'
import { SESSION_STORAGE_KEY } from '../../components/common/utility'
import RenderPageContent from '../../components/pages/renderPageContent'
import DisplayUserAndModifiedData from '../../components/common/userService'
import { useSelector } from 'react-redux'
import { getPublishedContentByIdAndType } from '../../services/generalApiService'
import { useQuery } from 'react-query'
import { IoDocumentTextOutline } from 'react-icons/io5'
import Footer from '../../components/main/Footer'
import ApiDocReview from '../../components/apiDocReview/apiDocReview'
// import '../../components/pages/page.scss'
import './publicPage.scss'

const queryConfig = {
    refetchOnWindowFocus: false,
    cacheTime: 5000000,
    enabled: true,
    staleTime: 600000, retry: 2
}

function PublicPage() {
    let currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)

    const { pages } = useSelector((state) => ({
        pages: state.pages,
    }))

    const getPagePublishedData = async () => {
        const data = await getPublishedContentByIdAndType(currentIdToShow, pages?.[currentIdToShow]?.type)
        return data;
    }

    let { data } = useQuery(['pageContent', currentIdToShow], getPagePublishedData, queryConfig)

    return (
        <div className='page-wrapper'>
            {data ? (
                <div className='pageText d-flex justify-content-center'>
                    <RenderPageContent pageContent={data} />
                </div>
            ) : (
                <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page'>
                    <IoDocumentTextOutline size={140} color='gray' />
                    <span className='empty-line'>
                        {pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name} is empty
                    </span>
                    <span className='mt-1 d-inline-block Modified-at fs-4'>
                        <DisplayUserAndModifiedData />
                    </span>
                </div>
            )}
            <ApiDocReview />
            <Footer />
        </div>
    )
}

export default PublicPage
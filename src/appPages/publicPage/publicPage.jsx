"use client"
import React from 'react';
import RenderPageContent from '../../components/pages/renderPageContent';
import DisplayUserAndModifiedData from '../../components/common/userService';
import { IoDocumentTextOutline } from 'react-icons/io5';
import ApiDocReview from '../../components/apiDocReview/apiDocReview';
import Providers from '../../app/providers/providers';
import './publicPage.scss';

function PublicPage(props) {
    const modifiedContent = props?.pageContentDataSSR?.contents
    return (
        <div className={`custom-display-public-page pl-4 overflow-auto`}>
            <div className={`page-wrapper d-flex flex-column ${modifiedContent ? 'justify-content-between' : 'justify-content-center'}`}>
                {modifiedContent ? (
                    <div className='pageText d-flex justify-content-center align-items-start'>
                        <RenderPageContent pageContentDataSSR={{ ...props.pageContentDataSSR, contents: modifiedContent }} />
                    </div>
                ) : (
                    <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page position-absolute'>
                        <IoDocumentTextOutline size={140} color='gray' />
                        <span className='empty-line'>
                            {props?.pageContentDataSSR?.name} is empty
                        </span>
                        <span className='mt-1 d-inline-block Modified-at font-12'>
                            <Providers>
                                <DisplayUserAndModifiedData />
                            </Providers>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PublicPage;

"use client"
import React from 'react';
import RenderPageContent from '../../components/pages/renderPageContent';
import DisplayUserAndModifiedData from '../../components/common/userService';
import { IoDocumentTextOutline } from 'react-icons/io5';
import ApiDocReview from '../../components/apiDocReview/apiDocReview';
import Providers from '../../app/providers/providers';
import './publicPage.scss';

function PublicPage(props) {
   /*  const removeBreadCollections = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const breadcrumbContainers = doc.querySelectorAll('.breadcrumb-container');

        breadcrumbContainers.forEach(container => {
            const breadcrumbSegments = container.querySelectorAll('.breadcrumb-segment');

            breadcrumbSegments.forEach(button => {
                if (button.id.startsWith('collection/')) {
                    const nextElement = button.nextElementSibling;
                    button.remove();
                    if (nextElement && nextElement.classList.contains('breadcrumb-separator')) {
                        nextElement.remove();
                    }
                }
            });
        });

        return doc.body.innerHTML;
    }; */

    // Create a new variable for the modified content
    const modifiedContent = props?.pageContentDataSSR?.contents
        /* ? removeBreadCollections(props.pageContentDataSSR.contents)
        : null; */

    return (
        <div className={`custom-display-page custom-display-public-page overflow-auto`}>
            <div className={`page-wrapper d-flex flex-column ${modifiedContent ? 'justify-content-between' : 'justify-content-center'}`}>
                {modifiedContent ? (
                    <div className='pageText d-flex justify-content-center align-items-start'>
                        <RenderPageContent pageContentDataSSR={{ ...props.pageContentDataSSR, contents: modifiedContent }} />
                    </div>
                ) : (
                    <div className='d-flex flex-column justify-content-center align-items-center empty-heading-for-page'>
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
                {modifiedContent && (
                    <div className='my-5'>
                        <Providers>
                            <ApiDocReview />
                        </Providers>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PublicPage;

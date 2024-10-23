"use client"
import React, { useEffect, useState } from 'react'
import Providers from '../../app/providers/providers'
import ApiDocReview from '../apiDocReview/apiDocReview'
import './renderPageContent.scss'
import ChatbotWidget from 'src/script/ChatWidget';

export default function RenderPageContent(props) {

    const [htmlWithIds, setHtmlWithIds] = useState('');

    const addIdsToHeadings = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        Array.from(headingElements).map((heading, index) => {
            const id = `heading-${index}`;
            heading.setAttribute('id', id);
            return { id, text: heading.innerText, tag: heading.tagName.toLowerCase() };
        });
        return doc.body.innerHTML;
    };

    useEffect(() => {
        const html = addIdsToHeadings(props?.pageContentDataSSR?.contents);
        setHtmlWithIds(html);
    }, [props?.pageContentDataSSR?.contents]);


    return (
        <>
            <div className="d-flex flex-column main-page-content-container">
                {props?.pageContentDataSSR?.contents &&
                    <div className='main-page-content d-flex flex-column justify-content-start align-items-start tiptap'>
                        <div className='page-text-render w-100 d-flex justify-content-between align-items-center'>
                            <h1 className={`font-weight-bold border-0 w-100 d-flex align-items-center mt-0`}>{props?.pageContentDataSSR?.name}</h1>
                        </div>
                        <div className="page-text-render w-100 d-flex justify-content-center mt-3">
                            <div id='__page__content' className='w-100'><div className='page-content-body' dangerouslySetInnerHTML={{ __html: htmlWithIds || props?.pageContentDataSSR?.contents }} /></div>
                        </div>
                    </div>
                }
                {props?.pageContentDataSSR?.contents && (
                    <div className='my-5'>
                        <Providers>
                            <ApiDocReview />
                        </Providers>
                    </div>
                )}
                {props?.webToken && <ChatbotWidget webToken={props?.webToken} />}
            </div>
        </>
    )
}
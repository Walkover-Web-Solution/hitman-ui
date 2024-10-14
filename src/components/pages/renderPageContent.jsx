"use client"
import React, { useEffect, useState } from 'react'
import './renderPageContent.scss'
import HoverBox from './hoverBox/hoverBox';

export default function RenderPageContent(props) {

    const [htmlWithIds, setHtmlWithIds] = useState('')
    const [headings, setHeadings] = useState([]);

    const addIdsToHeadings = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headings = Array.from(headingElements).map((heading, index) => {
            const id = `heading-${index}`;
            heading.setAttribute('id', id);
            return { id, text: heading.innerText, tag: heading.tagName.toLowerCase() };
        });
        setHeadings(headings);
        return doc.body.innerHTML;
    };

    useEffect(() => {
        const html = addIdsToHeadings(props?.pageContentDataSSR?.contents);
        setHtmlWithIds(html);
    }, [props?.pageContentDataSSR?.contents]);

    const scrollToHeading = (headingId) => {
        document.getElementById(headingId).scrollIntoView({ behavior: "smooth" });
    }

    return (
        <>
            {props?.pageContentDataSSR?.contents &&
                <div className='main-page-content d-flex flex-column justify-content-start align-items-start w-75 tiptap'>
                    <div className='mb-4 page-text-render w-100 d-flex justify-content-between align-items-center'>
                        <span className='page-name font-weight-bold mt-5 border-0 w-100 d-flex align-items-center'>{props?.pageContentDataSSR?.name}</span>
                    </div>
                    <div className="page-text-render w-100 d-flex justify-content-center">
                        <div className='w-100'><div className='page-content-body' dangerouslySetInnerHTML={{ __html: htmlWithIds || props?.pageContentDataSSR?.contents }} /></div>
                        <HoverBox scrollToHeading={scrollToHeading} headings={headings} />
                    </div>
                </div>
            }
        </>
    )
}
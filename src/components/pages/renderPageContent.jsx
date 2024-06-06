import React, { useEffect, useState } from 'react'
import {
    isDashboardRoute,
    isStateDraft,
    isStateReject,
    msgText,
    isStatePending,
    isStateApproved,
    getEntityState,
    isOnPublishedPage
  } from '../common/utility'

export default function RenderPageContent(props) {

    const [headings, setHeadings] = useState([]);
    const [htmlWithIds, setHtmlWithIds] = useState(props?.pageContent);

    const addIdsToHeadings = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const h2Elements = doc.querySelectorAll('h2');
        const h2Headings = Array.from(h2Elements).map((h2, index) => {
            const id = `heading-${index}`;
            h2.setAttribute('id', id);
            return { id, text: h2.innerText };
        });
        setHeadings(h2Headings);
        return doc.body.innerHTML;
    };

    useEffect(() => {
        setHtmlWithIds(addIdsToHeadings(props?.pageContent));
    }, [props?.pageContent]);

    const scrollToHeading = (headingId) => {
        document.getElementById(headingId).scrollIntoView({ behavior: "smooth" });
    }

    return (
        <>
            {headings.length > 0 && (
                <div className={`page-text-render w-100 d-flex flex-lg-row flex-column-reverse`}>
                    {headings.length > 0 && (<div className='doc-view' dangerouslySetInnerHTML={{ __html: htmlWithIds }} />)}
                    {isOnPublishedPage() && headings.length > 0 && (
                        <>
                            <div className='editor-headings  d-flex flex-column h-100'>
                                <span className='text-secondary pb-2 d-inline-block'> In this page</span>
                                <div className='border border-2 p-2 rounded-lg h-100'>
                                    <div>
                                        {headings.map((heading) => (
                                            <div key={heading.id}>
                                                <span onClick={() => scrollToHeading(heading.id)} className='d-block w-100 py-1 cursor-pointer'>
                                                    {heading.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    )
}

import React, { useEffect, useState } from 'react'
import {isOnPublishedPage} from '../common/utility'

export default function RenderPageContent(props) {

    const [headings, setHeadings] = useState([]);
    const [htmlWithIds, setHtmlWithIds] = useState('');

    const addIdsToHeadings = (html) => {
        if (!html || typeof html !== 'string') {
            return '';
        }
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const h2Elements = doc.querySelectorAll('h2');
        const h2Headings = Array.from(h2Elements).reduce((acc, h2, index) => {
            const text = h2.innerText.trim();
            if (text) {
                const id = `heading-${index}`;
                h2.setAttribute('id', id);
                acc.push({ id, text });
            }
            return acc;
        }, []);
        setHeadings(h2Headings);
        return doc.body.innerHTML;
    };

    useEffect(() => {
        if (props?.pageContent && Object.keys(props.pageContent).length > 0) {
            const updatedHtml = addIdsToHeadings(props.pageContent);
            setHtmlWithIds(updatedHtml);
        } else {
            setHtmlWithIds('');
            setHeadings([]);
        }
    }, [props?.pageContent]);

    const scrollToHeading = (headingId) => {
        document.getElementById(headingId).scrollIntoView({ behavior: "smooth" });
    }

    return (
        <>
            <div className={`page-text-render w-100 d-flex flex-lg-row flex-column-reverse`}>
                <div className='doc-view' dangerouslySetInnerHTML={{ __html: htmlWithIds }} />
                {isOnPublishedPage() && headings.length > 0 && (
                    <div className='editor-headings d-flex flex-column h-100'>
                        <span className='pb-2 text-dark d-inline-block font-weight-bold fs-3'> On this page</span>
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
                )}
            </div>
        </>
    )
}

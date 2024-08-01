import React, { useEffect, useState } from 'react'
import { isOnPublishedPage } from '../common/utility'

export default function RenderPageContent(props) {

    const [headings, setHeadings] = useState([]);
    const [htmlWithIds, setHtmlWithIds] = useState(props?.pageContent || '');
    const [innerText, setInnerText] = useState('');

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
        setInnerText(doc.body.innerText)
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
            {innerText.length > 0 &&
                <div className={`page-text-render w-100 d-flex flex-lg-row flex-column-reverse`}>
                    <div className='page-content-body' dangerouslySetInnerHTML={{ __html: htmlWithIds }} />
                    {isOnPublishedPage() && headings.length > 0 && (
                        <>
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
                        </>
                    )}
                </div>
            }
        </>
    )
}

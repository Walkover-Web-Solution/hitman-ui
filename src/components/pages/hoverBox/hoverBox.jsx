'use client'
import React, { useEffect, useState } from 'react'

export default function HoverBox({ html }) {
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        addIdsToHeadings(html)
    }, [])

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

    const scrollToHeading = (headingId) => {
        document.getElementById(headingId).scrollIntoView({ behavior: "smooth" });
    }

    return (
        <React.Fragment>
            {headings.length > 0 && (
                <div className='heading-main'>
                    <div className='editor-headings px-2 rounded-sm d-flex flex-column py-5'>
                        {headings.map((heading) => (
                            <p onClick={() => scrollToHeading(heading.id)} className=' m-0 p-1 cursor-pointer'>
                                {heading.text}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
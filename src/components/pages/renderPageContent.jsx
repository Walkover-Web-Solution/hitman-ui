import React, { useEffect, useState } from 'react'

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
        <div className=' w-100 d-flex justify-content-center'>
            <div className='doc-view' dangerouslySetInnerHTML={{ __html: htmlWithIds }} />

            <div className='editor-headings border border-2 p-2 rounded-lg'>
                <ul>
                    {headings.map((heading) => (
                        <li key={heading.id}>
                            <div onClick={() => scrollToHeading(heading.id)}>
                                {heading.text}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

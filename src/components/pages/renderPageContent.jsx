import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import DisplayUserAndModifiedData from '../common/userService';
import HoverBox from './hoverBox/hoverBox';

export default function RenderPageContent(props) {

    const { pages } = useSelector((state) => ({
        pages: state.pages,
    }))

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
        })
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
        <React.Fragment>
            {innerText?.length > 0 &&
                <div className='main-page-content d-flex flex-column justify-content-center align-items-center w-50'>
                    <div className='mb-4 page-text-render w-100 d-flex justify-content-between align-items-center'>
                        <span className='page-header d-flex align-items-center'>{pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name}</span>
                        <DisplayUserAndModifiedData />
                    </div>
                    <div className="page-text-render w-100 d-flex justify-content-center">
                        <div className='page-content-body' dangerouslySetInnerHTML={{ __html: htmlWithIds }} />
                        <HoverBox scrollToHeading={scrollToHeading} headings={headings} />
                    </div>
                </div>
            }
        </React.Fragment>
    )
}

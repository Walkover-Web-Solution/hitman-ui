import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './renderPageContent.scss'
import HoverBox from './hoverBox/hoverBox';
import { getUrlPathById, isTechdocOwnDomain, SESSION_STORAGE_KEY } from '../common/utility';

export default function RenderPageContent(props) {

    const { pages } = useSelector((state) => ({
        pages: state.pages,
    }))

    const navigate = useNavigate();
    const [headings, setHeadings] = useState([]);
    const [htmlWithIds, setHtmlWithIds] = useState(props?.pageContent || '');
    const [innerText, setInnerText] = useState('');

    function handleBreadcrumbClick(event) {
        const breadcrumbSegmentId = event.target.getAttribute('id');
        let id = breadcrumbSegmentId.split('/');
        if(id[0] === 'collection'){
            return;
        }
        id = id[1];
        sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
        let pathName = getUrlPathById(id, pages)
        pathName = isTechdocOwnDomain() ? `/p/${pathName}` : `/${pathName}`
        navigate(pathName)
    }

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
        setInnerText(doc.body.innerText);
        return doc.body.innerHTML;
    };

    useEffect(() => {
        const html = addIdsToHeadings(props?.pageContent);
        setHtmlWithIds(html);
    }, [props?.pageContent]);
    
    useEffect(() => {
        setTimeout(() => {
                const getBtn = document.querySelectorAll('.breadcrumb-segment');
                getBtn.forEach(button => {
                   button.addEventListener('click', (e) => handleBreadcrumbClick(e));
                });
        },10);
    }, [htmlWithIds])
    
    const scrollToHeading = (headingId) => {
        document.getElementById(headingId).scrollIntoView({ behavior: "smooth" });
    }

    return (
        <React.Fragment>
            {innerText?.length > 0 &&
                <div className='main-page-content d-flex flex-column justify-content-start align-items-start w-50 tiptap'>
                    <div className='mb-4 page-text-render w-100 d-flex justify-content-between align-items-center'>
                        <span className='page-name font-weight-bold mt-5 border-0 w-100 d-flex align-items-center'>{pages?.[sessionStorage.getItem('currentPublishIdToShow')]?.name}</span>
                    </div>
                    <div className="page-text-render w-100 d-flex justify-content-center">
                        <div className='w-100'><div className='page-content-body' dangerouslySetInnerHTML={{ __html: htmlWithIds }} /></div>
                        <HoverBox scrollToHeading={scrollToHeading} headings={headings} />
                    </div>
                </div>
            }
        </React.Fragment>
    )
}
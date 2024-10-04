import React from 'react';
import RenderPageContentClient from '../client/RenderPageContentClient';
import { getPublishedContentByIdAndType } from './utility';

export default async function RenderPageContentServer({ pageContent, pageId }) {
  // Fetch page name and content
  const { pageName, content } = await fetchPageData(pageId);

  // Process HTML to add IDs to headings
  const { htmlWithIds, headings, innerText } = await addIdsToHeadings(content);

  return (
    <>
      {innerText?.length > 0 && (
        <div className="main-page-content d-flex flex-column justify-content-start align-items-start w-50 tiptap">
          <div className="mb-4 page-text-render w-100 d-flex justify-content-between align-items-center">
            <span className="page-name font-weight-bold mt-5 border-0 w-100 d-flex align-items-center">
              {pageName}
            </span>
          </div>
          <div className="page-text-render w-100 d-flex justify-content-center">
            <div className="w-100">
              <div
                className="page-content-body"
                dangerouslySetInnerHTML={{ __html: htmlWithIds }}
              />
            </div>
            {/* Pass headings to the client component */}
            <RenderPageContentClient headings={headings} />
          </div>
        </div>
      )}
    </>
  );
}

async function addIdsToHeadings(html) {
  // Dynamically import 'jsdom' only on the server
  const { JSDOM } = await import('jsdom');

  const dom = new JSDOM(html);
  const { document } = dom.window;
  const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

  const headings = Array.from(headingElements).map((heading, index) => {
    const id = `heading-${index}`;
    heading.setAttribute('id', id);
    return { id, text: heading.textContent, tag: heading.tagName.toLowerCase() };
  });

  const innerText = document.body.textContent;
  const htmlWithIds = document.body.innerHTML;

  return { htmlWithIds, headings, innerText };
}



async function fetchPageData(pageId) {
  try {
    pageId = 'PgQby2XivxFV'
debugger
    // Use the service function to get published content
    const contentType = 1; // Set the content type as needed
    const content = await getPublishedContentByIdAndType(pageId, contentType);

    // You can extend this to fetch the page name if available in the API response
    return {
      pageName: 'Page Name', // Replace with actual page name from API if available
      content: content,
    };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return {
      pageName: 'Page Name',
      content: '',
    };
  }
}
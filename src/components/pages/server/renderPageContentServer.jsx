import React from 'react';
import RenderPageContentClient from '../client/RenderPageContentClient';

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
  if (typeof window === 'undefined') {
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
 }else {
  return {htmlWithIds: '<h1>Heading 1</h1><p>Some content...</p><h2>Heading 2</h2><p>More content...</p>', headings : 'hello', innerText :'nothing'}
 }
}

async function fetchPageData(pageId) {
  // Implement your data fetching logic here.
  // This function should return an object with pageName and content.
  // Replace the following mock data with actual data fetching:
  return {
    pageName: 'Page Name',
    content: '<h1>Heading 1</h1><p>Some content...</p><h2>Heading 2</h2><p>More content...</p>',
  };
}
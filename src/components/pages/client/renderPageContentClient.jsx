'use client';
import React from 'react';
import HoverBox from '../hoverBox/hoverBox';

export default function RenderPageContentClient({ headings }) {
  const scrollToHeading = (headingId) => {
    document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setHtmlWithIds(addIdsToHeadings(props?.pageContent));
}, [props?.pageContent]);

  return (
    <HoverBox scrollToHeading={scrollToHeading} headings={headings} />
  );
}
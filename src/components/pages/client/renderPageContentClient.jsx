

import React from 'react';
import HoverBox from '../hoverBox/hoverBox';

'use client';
export default function RenderPageContentClient({ headings }) {
  const scrollToHeading = (headingId) => {
    document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HoverBox scrollToHeading={scrollToHeading} headings={headings} />
  );
}
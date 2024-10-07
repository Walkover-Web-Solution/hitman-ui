'use client'
import React from 'react'

export default function HoverBox(props) {
    const scrollToHeading = (headingId) => {
        document.getElementById(headingId)?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <React.Fragment>
            {props?.headings.length > 0 && (
                <div className='heading-main position-fixed'>
                    <div className='editor-headings p-2 rounded-sm position-fixed d-flex flex-column'>
                        {props?.headings.map((heading) => (
                            <span onClick={() => scrollToHeading(heading.id)} className='d-block w-100 p-1 cursor-pointer'>
                                {heading.text}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
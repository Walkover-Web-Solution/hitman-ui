import React from 'react'
import { isOnPublishedPage } from '../../common/utility'

export default function HoverBox(props) {
    return (
        <React.Fragment>
            {isOnPublishedPage() && props?.headings.length > 0 && (
                <div className='heading-main position-fixed'>
                    <div className='editor-headings p-2 rounded-sm position-fixed d-flex flex-column'>
                        <div className='h-100'>
                            <div>
                                {props?.headings.map((heading) => (
                                    <div key={heading.id}>
                                        <span onClick={() => props?.scrollToHeading(heading.id)} className='d-block w-100 py-1 cursor-pointer'>
                                            {heading.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
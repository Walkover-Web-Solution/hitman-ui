import React from 'react'
import { hexToRgb } from '../common/utility'
import  TECHDOCPUBLISH  from '@/assets/icons/TECHDOC.svg'

function Footer({ theme }) {
  const domainName = window.location.hostname
  const domainSrc = process.env.NEXT_PUBLIC_UI_URL + '?src=' + domainName

  return (
      <div className='footerWrapper'>
        <p className='for-public-view d-flex justify-content-center align-items-center'>
          <span className='poweredByText'>
            Powered by
          </span>
          <a
            className='hitmanLink'
            rel='noopener noreferrer'
            target='_blank'
            href={domainSrc}
            style={{ backgroundColor: hexToRgb(theme, '1') }}
            aria-label="hitman-link"
          >
            <TECHDOCPUBLISH className='TECHDOC-svg' />
          </a>
        </p>
      </div>
  )
}

export default Footer

import React from 'react'
import { hexToRgb } from '../common/utility'
import { ReactComponent as TECHDOCPUBLISH } from '../../assets/icons/TECHDOC.svg'

function Footer({ theme }) {
  const domainName = window.location.hostname
  const domainSrc = process.env.REACT_APP_UI_URL + '?src=' + domainName

  return (
    // <footer>
      <div className='footerWrapper my-4'>
        <p className='for-public-view' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span className='poweredByText' style={{ color: 'grey'}}>
            Powered by{' '}
          </span>
          <a
            className='hitmanLink'
            rel='noopener noreferrer'
            target='_blank'
            href={domainSrc}
            style={{ backgroundColor: hexToRgb(theme, '1') }}
          >
            <TECHDOCPUBLISH className='techdoc-svg' />
          </a>
        </p>
      </div>
    // </footer>
  )
}

export default Footer

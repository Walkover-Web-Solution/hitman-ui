import React from 'react'
import { hexToRgb } from '../common/utility'
import { ReactComponent as Hitman } from '../../assets/icons/hitman.svg'

function Footer({ theme }) {
  const domainName = window.location.hostname
  const domainSrc = process.env.REACT_APP_HITMAN_WEBSITE_URL + '?src=' + domainName

  return (
    <footer>
      <div className='footerWrapper'>
        <p className='for-public-view' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="poweredByText">Powered By </span>
          <a className="hitmanLink" rel='noopener noreferrer' target='_blank' href={domainSrc} style={{ backgroundColor: hexToRgb(theme, '1') }}>
            <Hitman />
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer

import React from 'react'
import { hexToRgb } from '../common/utility'

function Footer ({ theme }) {
  const domainName = window.location.hostname
  const domainSrc = process.env.REACT_APP_HITMAN_WEBSITE_URL + '?src=' + domainName

  return (

    <div className='inner-wrapper'>
      {/* <div className='community-wrapper'>
        <p>Engage and network with the entire viasocket community. Be a part of the discussion right now</p>
        <a href='http://forum.viasocket.com/' rel='noreferrer' target='_blank'>Community </a>
      </div> */}
      <footer>

        <div className='footerWrapper'>
          <p className='public-hide'>
            <span>Powered By</span> <a rel='noopener noreferrer' target='_blank' href={process.env.REACT_APP_HITMAN_WEBSITE_URL}>Hitman</a>
          </p>
          <p className='d-none for-public-view'>
            <a rel='noopener noreferrer' className='cta-type' target='_blank' href={domainSrc} style={{ backgroundColor: hexToRgb(theme, '1') }}>Built On Hitman</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Footer

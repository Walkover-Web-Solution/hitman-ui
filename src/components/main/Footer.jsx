import React from 'react'

function Footer ({ theme }) {
  return (

    <div className='inner-wrapper'>
      {/* <div className='community-wrapper'>
        <p>Engage and network with the entire viasocket community. Be a part of the discussion right now</p>
        <a href='http://forum.viasocket.com/' rel='noreferrer' target='_blank'>Community </a>
      </div> */}
      <footer>
        <div className='footerWrapper'>
          <p class='public-hide'>
            <span>Powered By</span> <a rel='noopener noreferrer' target='_blank' href='https://hitman.app/'>Hitman</a>
          </p>
          <p class='d-none for-public-view'>
            <a rel='noopener noreferrer' class='cta-type' target='_blank' href='https://hitman.app/' style={{ backgroundColor: theme }}>Built On Hitman</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Footer

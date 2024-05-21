import React from 'react'
import './indexWebsite.scss'
import { ReactComponent as Logo } from '../../assets/web/logo.svg'
export default function IndexWebsite() {
  return (
    <>
      <div>
        <div>
          {/* navabr */}
          <div className='navigation d-flex justify-content-between container'>
            <Logo />
            <div className='d-flex align-items-center nav-menu'>
              <a href='/login'>
                <button className='btn btn-secondary btn-lg'>Login</button>
              </a>
              <a href='/signin'>
                <button className='btn btn-primary btn-lg'>Signup</button>
              </a>
            </div>
          </div>
          {/* navabr */}
          <div className='container'>
            <div>
              <p className='web_tagline'>The developer's toolkit</p>
              <h1 className='web_h1'>
                Test & <br />
                <span className='font-american web_text-primary'>Document APIs</span>
                <br />
                Faster with TechDoc
              </h1>
              <button className='btn btn-primary btn-lg'>Get Started for free</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

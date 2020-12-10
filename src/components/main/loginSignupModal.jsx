import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'

function LoginSignupModal (props) {
  const redirectionUrl = process.env.REACT_APP_UI_URL + '/login'

  useEffect(() => {
    const ssoDiv = document.getElementById('sokt-sso-modal')

    if (ssoDiv) {
      ssoDiv.appendChild(window.ssoButton(ssoDiv))
    }
  }, [])

  return (
    <Modal
      {...props}
      id='modal-open-api'
      size='md'
      animation={false}
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >

      <Modal.Header closeButton />
      <Modal.Body>
        <div className='text-center'>
          {
            props.title === 'Save Endpoint'
              ? (
                <div>
                  <svg width='164' height='155' viewBox='0 0 164 155' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path opacity='0.45' d='M108.69 21.1977C122.514 27.0117 132.777 42.9113 133.192 58.6328C133.608 74.3543 124.293 89.8386 114.386 103.128C104.478 116.417 94.0368 127.57 81.1629 132.435C68.2891 137.3 52.9828 135.935 42.0074 129.113C31.032 122.29 24.4467 110.01 17.1496 97.907C9.85239 85.8044 1.8433 73.8204 0.300806 59.5227C-1.30101 45.225 3.50444 28.6135 14.4799 22.3249C25.4553 16.0363 42.66 20.0705 60.0427 19.9519C77.366 19.7739 94.808 15.443 108.69 21.1977Z' fill='url(#paint0_linear)' />
                    <path d='M35.6592 62.4297C35.7778 64.6841 35.6592 150.292 35.6592 150.292H41.6512L50.7875 94.0508C50.9061 92.2116 52.5673 72.0406 52.5673 72.0406L42.0071 61.2432L35.6592 62.4297Z' fill='url(#paint1_linear)' />
                    <path d='M59.8053 61.7773C59.8053 61.7773 66.6279 105.56 66.6279 107.34C66.6279 109.12 55.4152 149.521 55.4152 149.521H49.6605L54.5253 102.95L37.7358 63.5571' fill='url(#paint2_linear)' />
                    <path d='M31.3284 45.2246C31.0318 45.6992 29.074 50.2674 29.1927 52.0472C29.43 54.7762 31.3284 56.3187 34.5321 57.9798C35.4813 57.9798 36.4305 47.2417 36.4305 47.2417L33.5235 45.2246H31.3284Z' fill='#FFD4C4' />
                    <path d='M40.6427 30.0967C36.3118 33.4783 30.9131 44.869 30.9131 44.869C31.269 45.4623 33.0488 46.4708 35.1253 47.3607' fill='url(#paint3_linear)' />
                    <path d='M40.821 11.7054C42.0669 6.54396 46.5757 2.74706 50.5506 4.11157C54.8221 5.59474 56.246 9.9849 55.6527 15.3243C55.0594 20.6044 53.6356 24.8166 49.5421 23.808C45.3892 22.8588 39.5159 16.8668 40.821 11.7054Z' fill='#FFD4C4' />
                    <path d='M47.2283 26.9523C47.7622 26.9523 48.5334 26.9523 49.2454 26.8929C50.5505 26.8336 51.7371 27.7235 52.093 29.0287C54.4068 38.0463 61.1107 60.1752 59.8648 61.8363C57.6697 64.7433 42.1855 67.057 35.7189 62.4296C33.6425 60.9464 33.0492 35.258 41.8889 27.3082C41.7702 27.2489 44.8552 26.9523 47.2283 26.9523Z' fill='url(#paint4_linear)' />
                    <path d='M35.6592 150.292V154.386H49.6603V152.072L41.5918 150.292' fill='black' />
                    <path d='M49.6606 149.521V154.386H64.3736V152.487L55.4153 149.521' fill='black' />
                    <path d='M60.2205 40.2417C60.2205 40.2417 63.6614 44.2166 63.9581 44.9878C64.6107 44.4539 86.2649 25.2321 86.6208 24.9948C86.9768 24.7575 87.5701 24.7575 87.8074 24.9355C88.2226 25.1728 88.3413 25.7067 88.104 26.122C87.926 26.478 85.3156 28.7917 85.3156 28.7917C85.5529 29.0883 86.6208 31.8173 85.197 33.1225C84.2478 34.0124 83.1799 34.3091 82.112 33.7751C81.4001 34.5464 64.9666 52.7596 62.0596 52.7596C60.7544 52.7596 56.1863 48.0728 54.1099 44.5726' fill='#FFD4C4' />
                    <path d='M46.9907 33.7748C49.3045 39.3515 53.042 45.9367 54.5845 45.9367C56.127 45.9367 60.6358 41.9025 60.6358 40.538C60.6358 39.1735 52.0928 27.7235 50.9063 27.5455C48.8298 27.2488 45.9229 31.2237 46.9907 33.7748Z' fill='url(#paint5_linear)' />
                    <path d='M46.3978 12.4764C49.3641 12.4764 54.7628 6.66238 54.7628 6.42507C54.7628 5.89113 53.8729 3.16211 48.5335 3.16211C44.7366 3.16211 38.7446 5.83181 38.7446 14.5528C38.7446 19.0616 36.9648 23.8671 36.9648 26.0028C36.9648 29.3251 39.6345 31.5795 43.8467 31.4016C49.0081 31.1643 52.3304 27.664 52.3304 26.0028C52.3304 23.6298 51.3812 18.5277 46.6944 16.8665' fill='url(#paint6_linear)' />
                    <path d='M47.2283 16.6887C46.9317 16.8667 46.635 16.9854 46.2791 16.9854C45.2112 16.9854 44.3213 15.9768 44.3213 14.731C44.3213 13.4851 45.2112 12.4766 46.2791 12.4766C46.457 12.4766 46.6944 12.5359 46.8723 12.5952' fill='#FFD4C4' />
                    <path d='M97.0625 0.848633H157.754C160.72 0.848633 163.093 3.2217 163.093 6.18803V20.7824C163.093 23.7487 160.72 26.1218 157.754 26.1218H97.0625C94.0962 26.1218 91.7231 23.7487 91.7231 20.7824V6.1287C91.7825 3.2217 94.1555 0.848633 97.0625 0.848633Z' fill='#FFB594' />
                    <path d='M97.0625 34H157.754C160.72 34 163.093 36.3731 163.093 39.3394V53.9337C163.093 56.9001 160.72 59.2731 157.754 59.2731H97.0625C94.0962 59.2731 91.7231 56.9001 91.7231 53.9337V39.2801C91.7825 36.3731 94.1555 34 97.0625 34Z' fill='#FFE3D7' />
                    <path d='M104.834 21.5538C109.323 21.5538 112.962 17.9149 112.962 13.4261C112.962 8.93726 109.323 5.29834 104.834 5.29834C100.345 5.29834 96.7065 8.93726 96.7065 13.4261C96.7065 17.9149 100.345 21.5538 104.834 21.5538Z' fill='#FBF9F5' />
                    <path d='M106.91 16.6292H102.698C102.046 16.6292 101.512 16.0952 101.512 15.4427V13.4849C101.512 12.8323 102.046 12.2983 102.698 12.2983H106.91C107.563 12.2983 108.097 12.8323 108.097 13.4849V15.4427C108.156 16.0359 107.563 16.6292 106.91 16.6292Z' fill='#FFB594' />
                    <path d='M106.317 10.6372C106.317 9.80664 105.664 9.09473 104.774 9.09473C103.885 9.09473 103.232 9.74732 103.232 10.6372V13.4256H106.258V10.6372H106.317Z' stroke='#FFB594' stroke-miterlimit='10' />
                    <path opacity='0.74' d='M154.728 7.07812H118.005V10.3411H154.728V7.07812Z' fill='#FBF9F5' />
                    <path opacity='0.74' d='M154.728 14.9683H118.005V18.2312H154.728V14.9683Z' fill='#FBF9F5' />
                    <defs>
                      <linearGradient id='paint0_linear' x1='0.0118855' y1='76.7882' x2='133.246' y2='76.7882' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#F8B668' stop-opacity='0.7' />
                        <stop offset='0.3309' stop-color='#FFE5DC' />
                        <stop offset='0.6795' stop-color='#FFEFC7' />
                        <stop offset='0.9888' stop-color='#FFEEDE' />
                      </linearGradient>
                      <linearGradient id='paint1_linear' x1='35.6468' y1='105.745' x2='52.5353' y2='105.745' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#4A4A88' />
                        <stop offset='0.0275216' stop-color='#4C4B88' />
                        <stop offset='1' stop-color='#836B91' />
                      </linearGradient>
                      <linearGradient id='paint2_linear' x1='37.7999' y1='105.664' x2='66.6284' y2='105.664' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#4A4A88' />
                        <stop offset='0.0275216' stop-color='#4C4B88' />
                        <stop offset='1' stop-color='#836B91' />
                      </linearGradient>
                      <linearGradient id='paint3_linear' x1='30.9155' y1='38.7241' x2='40.6174' y2='38.7241' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#B5A8D2' />
                        <stop offset='0.4763' stop-color='#7F86C6' />
                        <stop offset='1' stop-color='#4864BA' />
                      </linearGradient>
                      <linearGradient id='paint4_linear' x1='34.3459' y1='45.963' x2='59.9361' y2='45.963' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#B5A8D2' />
                        <stop offset='0.4763' stop-color='#7F86C6' />
                        <stop offset='1' stop-color='#4864BA' />
                      </linearGradient>
                      <linearGradient id='paint5_linear' x1='37.0822' y1='56.6429' x2='62.8064' y2='24.5713' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#B5A8D2' />
                        <stop offset='0.4763' stop-color='#7F86C6' />
                        <stop offset='1' stop-color='#4864BA' />
                      </linearGradient>
                      <linearGradient id='paint6_linear' x1='36.9676' y1='17.3555' x2='54.7456' y2='17.3555' gradientUnits='userSpaceOnUse'>
                        <stop stop-color='#763266' />
                        <stop offset='0.5694' stop-color='#C56A7E' />
                        <stop offset='1' stop-color='#FD928F' />
                      </linearGradient>
                    </defs>
                  </svg>

                  <h5 className='heading-2 mt-3 mb-3'> Seems you are not logged in.</h5>
                </div>
                )
              : (
                <div className='loginModalWrapper'>
                  <h5> Seems you are not logged in.</h5>
                  <p>  Kindly login or signup to save collection in your account</p>
                  <div className='text-center mt-3'>
                    <button className='btn btn-primary btn-lg'>Login/Signup</button>
                  </div>
                </div>
                )
          }
          <div
            id='sokt-sso-modal'
            data-redirect-uri={redirectionUrl}
            data-source='sokt-app'
            data-token-key='sokt-auth-token'
            data-view='button'
          />
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default LoginSignupModal

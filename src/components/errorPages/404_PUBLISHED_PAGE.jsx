import React from 'react'

function Custom404({ message }) {
  return (
    <div className='text-center errorPage'>
      <h4>OOPS! 404</h4>
      {message ? <h3>{message}</h3> : null}
      <button
        onClick={() => {
          window.location.href = '/'
        }}
        mat-button
      >
        Return to Main Page
      </button>
    </div>
  )
}

export async function getServerSideProps(context) {
  const message =
    context?.err?.response?.data ||
    context.error_msg ||
    'Content Not Found. Please Enter the URL correctly.'

  return {
    props: { message }, // Passed to the page component as props
  }
}

export default Custom404
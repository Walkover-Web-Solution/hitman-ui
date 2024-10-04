import React from 'react'
import { useRouter } from 'next/router'

function Error403Page({ message }) {
  const router = useRouter();
  return (
    <div className='text-center errorPage'>
      <h4>Access Forbidden</h4>
      {message ? (
        <h3>{message}</h3>
      ) : (
        <h3>
          You do not have access to this entity. Please ask the organization admin to give access.
        </h3>
      )}
      <button onClick={() => router.push('/')}>Return to Dashboard</button>
    </div>
  )
}

export async function getServerSideProps(context) {
  // Set the HTTP status code to 403
  context.res.statusCode = 403;

  // Retrieve any error message passed as a query parameter
  const message = context.query.message || null;

  return {
    props: {
      message,
    },
  }
}

export default Error403Page
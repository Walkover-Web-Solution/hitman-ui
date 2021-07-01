// import httpService from './httpService'

export function getOrgUpdatedAt (orgId) {
  return resolveAfter2Seconds('2021-07-05')
}

function resolveAfter2Seconds (x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x)
    }, 2000)
  })
}

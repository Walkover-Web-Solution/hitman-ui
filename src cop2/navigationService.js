// navigationService.js

'use client'

let router
let params = {}

export const setRouter = (r) => {
  router = r
}

export const navigateTo = (path, options = {}) => {
  if (router) {
    router.push(path, options)
  } else {
    console.error('Router is not set')
  }
}

export const setParams = (p) => {
  params = p
}

export const getParams = () => {
  return params
}
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { store } from '../../store/store'
import ReactHtmlParser from 'html-react-parser'

const DisplayCollection = (props) => {
  const [description, setDescription] = useState('')
  const collections = useSelector((state) => state.collections)

  useEffect(() => {
    const collectionId = props.location.pathname.split('/')[2]
    fetchCollection(collectionId)
    const unsubscribe = store.subscribe(() => fetchCollection(collectionId))

    return () => {
      unsubscribe()
    }
  }, [props.location])

  useEffect(() => {
    const collectionId = props.match.params.collectionIdentifier
    if (collections[collectionId]) {
      setDescription(collections[collectionId].description)
    }
  }, [collections, props.match.params.collectionIdentifier])

  const fetchCollection = (collectionId) => {
    const collection = collections[collectionId]
    if (collection) {
      setDescription(collection.description)
    }
  }

  return <div className='collection-description'>{ReactHtmlParser(description)}</div>
}

export default DisplayCollection

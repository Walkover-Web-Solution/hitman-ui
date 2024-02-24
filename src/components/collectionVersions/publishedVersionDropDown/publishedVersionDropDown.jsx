import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'

export default function PublishedVersionDropDown(props) {
  const { pages } = useSelector((state) => {
    return {
      pages: state.pages
    }
  })

  const [show, setShow] = useState([])

  useEffect(() => {
    const data = showDropDown()
    setShow(data)
  }, [props?.rootParentId])

  function checkIfVersionHasPublishedChild(versionId) {
    if (!pages?.[versionId]) return false

    for (let index = 0; index < pages[versionId].child.length; index++) {
      if (pages?.[pages[versionId].child[index]] && pages?.[pages[versionId].child[index]]?.isPublished) {
        return true
      }
    }
    return false
  }

  function showDropDown() {
    if (pages?.[props?.rootParentId]?.child?.length === 0) return []
    return pages?.[props?.rootParentId]?.child.filter((versionId) => {
      const value = checkIfVersionHasPublishedChild(versionId)
      if (pages?.[versionId] && pages?.[versionId]?.isPublished && value) {
        return versionId
      }
    })
  }

  if (show?.length === 0) return null
  return (
    <DropdownButton
      key={props?.rootParentId}
      className=''
      id={`dropdown-basic-button-${props?.rootParentId}`}
      onClick={(e) => e.stopPropagation()}
      title={pages?.[props?.rootParentId]?.child?.length === 1 ? props.defaultVersionName : props.selectedVersionName}
    >
      {show.map((childId, index) => (
        <Dropdown.Item key={index} onClick={() => props.handleDropdownItemClick(childId, props?.rootParentId)}>
          {pages[childId]?.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )
}

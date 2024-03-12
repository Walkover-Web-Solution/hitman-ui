import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import OutsideClickHandler from 'react-outside-click-handler';

export default function PublishedVersionDropDown(props) {
  const { pages } = useSelector((state) => {
    return {
      pages: state.pages
    }
  })

  const [showVersionList, setShowVersionList] = useState([])
  const [versionDropDownState, setVersionDropDownState] = useState(false)

  useEffect(() => {
    const data = showDropDown()
    setShowVersionList(data)
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
      else if (pages?.[versionId]?.state === 1) {
        return versionId
      }
    })
  }

  const handleDropdownBtnClick = (e) => {
    e.stopPropagation()
    setVersionDropDownState(!versionDropDownState)
  }

  if (showVersionList?.length === 0) return null

  return (
    <OutsideClickHandler onOutsideClick={() => {
      setVersionDropDownState(false)
    }}>
      <DropdownButton
        key={props?.rootParentId}
        className=''
        id={`dropdown-basic-button-${props?.rootParentId}`}
        onClick={(e) => handleDropdownBtnClick(e)}
        title={pages?.[props?.rootParentId]?.child?.length === 1 ? props.defaultVersionName : props.selectedVersionName}
        show={versionDropDownState}
      >
        {showVersionList.map((childId, index) => (
          <Dropdown.Item key={index} onClick={() => props.handleDropdownItemClick(childId, props?.rootParentId)}>
            {pages[childId]?.name}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </OutsideClickHandler>
  )
}

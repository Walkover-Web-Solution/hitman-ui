import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'

export default function VersionPublishDropdown(props) {
    const [defaultVersion, setDefaultVersion] = useState('')
    const [selectedVersion, setSelectedVersion] = useState('')

  useEffect(() => {
    var defaultVersion = findDefaultVersion()
    setDefaultVersion(defaultVersion)
  }, [])

  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })
  const handleDropdownItemClick = (childId) => {
    var selected = pages[childId].name
    console.log(selected, "selecteddd");
    setSelectedVersion(...selected)
    console.log('inisde handle dropdown clickedddd', childId)
  }

  const findDefaultVersion = () => {
    const children = pages[props.rootParentId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1)
  }
  
console.log(selectedVersion.name, "selected version nameee");
  return (
    <DropdownButton
      className=''
      id='dropdown-basic-button'
      onClick={(event) => event.stopPropagation()}
      title={
        <span className='dropdown-title'>
          {pages?.[props.rootParentId]?.child?.length === 1 ? defaultVersion?.name : selectedVersion?.name}
        </span>
      }
    >
      {pages[props.rootParentId].child.map((childId, index) => (
        <Dropdown.Item key={index} onClick={(e) => handleDropdownItemClick(childId)}>
          <span className='dropdown-item-text'>{pages[childId]?.name}</span>
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )
}

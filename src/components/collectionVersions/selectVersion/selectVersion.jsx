import React, { useEffect, useState } from 'react'
import CustomModal from '../../customModal/customModal'
import { useSelector, useDispatch } from 'react-redux'
import { IoMdArrowDropdown } from 'react-icons/io'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
import { BiSolidPencil } from 'react-icons/bi'
import { Button } from 'react-bootstrap'
import './selectVersion.scss'
import { deletePage } from '../../pages/redux/pagesActions'
import { onDefaultVersion } from '../../publishDocs/redux/publishDocsActions'

const VersionInput = (props) => {
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })

  const [showEdit, setShowEdit] = useState(false)

  return (
    <div className='d-flex justify-content-start align-items-center'>
      {showEdit ? (
        <div className='d-flex justify-content-start align-items-center'>
          <input
            onBlur={() => setShowEdit(false)}
            type='text'
            className='form-control version-input col-form-label-sm'
            aria-label='Small'
            aria-describedby='inputGroup-sizing-sm'
          ></input>
          <Button id='publish_collection_btn' variant='btn btn-outline ml-2' onClick={() => setShowEdit(false)}>
            Save
          </Button>
        </div>
      ) : (
        <div className='d-flex justify-content-start align-items-center'>
          <div className='version-title'>{pages?.[props?.singleChildId]?.name}</div>
          <BiSolidPencil className='cursor-pointer ml-1' onClick={() => setShowEdit(true)} />
          {pages[props?.singleChildId]?.state === 1 && <span class='badge badge-primary ml-1'>Default</span>}
        </div>
      )}
    </div>
  )
}

const AddVersion = () => {
  return (
    <div className='d-flex justify-content-start'>
      <input type='text' class='form-control add-version-input' aria-label='Small' aria-describedby='inputGroup-sizing-sm'></input>
      <Button id='publish_collection_btn' className='btn-sm' variant='btn btn-outline ml-2'>
        Add
      </Button>
    </div>
  )
}

export default function SelectVersion(props) {
  const dispatch = useDispatch()
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })
  const [defaultVersionData, setDefaultVersionData] = useState('')

  useEffect(()=>{
    const defaultVersion = findDefaultVersion()
    setDefaultVersionData(defaultVersion)
  },[])

  const findDefaultVersion = () => {
    const children = pages[props?.parentPageId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1)
  }

  const handleDeleteVersion = (versionId) =>{
    const versionToDelete = pages[versionId]
    dispatch(deletePage(versionToDelete))
  }

  const handleDefaultVersion = async(versionId) =>{
  var orgList = localStorage.getItem("organisation");
  orgList = JSON.parse(orgList)
  console.log(orgList.id, "org iddd");
   const versionData = {"oldVersionId": defaultVersionData.id , "newVersionId": versionId}
   console.log(versionData, "version Data");
    dispatch(onDefaultVersion(orgList.id, versionData))
  }

  return (
    <div className='p-4 version-modal-container'>
      <h4>Manage Versions</h4>
      <hr />
      {pages[props?.parentPageId]?.child?.map((singleChildId) => {
        return (
          <div>
            <div className='d-flex justify-content-between align-items-center mt-3'>
              <VersionInput singleChildId={singleChildId} />
              <div>
                {pages?.[singleChildId]?.state !== 1 && (
                  <Button variant='btn btn-outline ml-1' className='btn-sm' onClick={()=>{
                    handleDefaultVersion(singleChildId)
                  }}>
                    Default
                  </Button>
                )}
                {pages?.[singleChildId]?.state !== 1 &&
                  <DeleteIcon className='ml-2 cursor-pointer' size={22} onClick = {()=>{handleDeleteVersion(singleChildId)}}  />}
              </div>
            </div>
          </div>
        )
      })}
      <hr />
      <AddVersion />
    </div>
  )
}
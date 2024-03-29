import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
import { BiSolidPencil } from 'react-icons/bi'
import { Button } from 'react-bootstrap'
import { updatePage } from '../../pages/redux/pagesActions'
import { addParentPageVersion } from '../redux/collectionVersionsActions'
import { deletePage } from '../../pages/redux/pagesActions'
import { onDefaultVersion } from '../../publishDocs/redux/publishDocsActions'
import './selectVersion.scss'
import { toast } from 'react-toastify'

const VersionInput = (props) => {
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })
  const versionNameInputRef = useRef()

  const dispatch = useDispatch()

  const onRename = (versionId) => {
    dispatch(updatePage(null, { ...pages?.[versionId], name: versionNameInputRef.current.value }))
    props.setShowEdit(null)
  }

  return (
    <div className='d-flex justify-content-start align-items-center'>
      {props?.showEdit === props?.index ? (
        <div className='d-flex justify-content-start align-items-center'>
          <input
            type='text'
            className='form-control version-input col-form-label-sm'
            aria-label='Small'
            aria-describedby='inputGroup-sizing-sm'
            defaultValue={pages?.[props?.singleChildId]?.name}
            ref={versionNameInputRef}
          ></input>
          <Button id='publish_collection_btn' variant='btn btn-outline ml-2' onClick={() => onRename(props?.singleChildId)}>
            Save
          </Button>
        </div>
      ) : (
        <div className='d-flex justify-content-start align-items-center'>
          <div className='version-title'>{pages?.[props?.singleChildId]?.name}</div>
          <BiSolidPencil className='cursor-pointer ml-1' onClick={() => props?.setShowEdit(props?.index)} />
          {pages[props?.singleChildId]?.state === 1 && <span class='badge badge-primary ml-1'>Default</span>}
        </div>
      )}
    </div>
  )
}

const AddVersion = (props) => {
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })

  const dispatch = useDispatch()

  const newVersionNameInputRef = useRef()

  const addVersion = () => {
    if (newVersionNameInputRef.current.value.trim().length === 0) return toast.error('Cannot Add Empty Value')
    const versionChilds = pages?.[props?.parentPageId]?.child
    try {
      versionChilds.forEach((element) => {
        if (pages[element]?.name.trim() === newVersionNameInputRef.current.value.trim()) {
          throw new Error('StopIteration')
        }
      })
    } catch (error) {
      return toast.error('Version Name already Exist!')
    }
    const parentPageId = props?.parentPageId
    const newVersion = { name: newVersionNameInputRef.current.value.trim(), state: 0 }
    newVersionNameInputRef.current.value = ''
    dispatch(addParentPageVersion(newVersion, parentPageId))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      addVersion()
    }
  }

  return (
    <div className='d-flex justify-content-start'>
      <input
        placeholder='Add New Version'
        type='text'
        class='form-control add-version-input'
        aria-label='Small'
        aria-describedby='inputGroup-sizing-sm'
        ref={newVersionNameInputRef}
        onKeyDown={handleKeyDown}
      ></input>
      <Button onClick={addVersion} id='publish_collection_btn' className='btn-sm' variant='btn btn-outline ml-2'>
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

  const findDefaultVersion = () => {
    const children = pages[props?.parentPageId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1)
  }

  const handleDeleteVersion = (versionId) => {
    const versionToDelete = pages[versionId]
    dispatch(deletePage(versionToDelete))
  }

  const handleDefaultVersion = async (versionId) => {
    var orgList = localStorage.getItem('organisation')
    orgList = JSON.parse(orgList)
    const defaultVersionData = findDefaultVersion()
    const versionData = { oldVersionId: defaultVersionData.id, newVersionId: versionId }
    dispatch(onDefaultVersion(orgList.id, versionData))
  }

  const [showEdit, setShowEdit] = useState(null)

  return (
    <div className='p-4 version-modal-container'>
      <h4>Manage Versions</h4>
      <hr />
      {pages[props?.parentPageId]?.child?.map((singleChildId, index) => {
        return (
          <div>
            <div className='d-flex justify-content-between align-items-center mt-3'>
              <VersionInput setShowEdit={setShowEdit} showEdit={showEdit} index={index} singleChildId={singleChildId} />
              <div>
                {pages?.[singleChildId]?.state !== 1 && (
                  <Button
                    variant='btn btn-outline ml-1'
                    className='btn-sm'
                    onClick={() => {
                      handleDefaultVersion(singleChildId)
                    }}
                  >
                    Default
                  </Button>
                )}
                {pages?.[singleChildId]?.state !== 1 && (
                  <DeleteIcon
                    className='ml-2 cursor-pointer'
                    size={22}
                    onClick={() => {
                      handleDeleteVersion(singleChildId)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )
      })}
      <hr />
      <AddVersion {...props} />
    </div>
  )
}

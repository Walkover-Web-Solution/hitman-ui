import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
import { BiSolidPencil } from 'react-icons/bi'
import { Button } from 'react-bootstrap'
import './selectVersion.scss'

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
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })

  console.log(props.parentPageId, 1234)
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
                  <Button variant='btn btn-outline ml-1' className='btn-sm'>
                    Default
                  </Button>
                )}
                <DeleteIcon className='ml-2 cursor-pointer' size={22} />
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

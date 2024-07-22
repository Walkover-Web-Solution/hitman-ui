import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import WarningModal from '../common/warningModal'
import { toast } from 'react-toastify'
import * as _ from 'lodash'
import tabService from '../tabs/tabService'
import Tiptap from '../tiptapEditor/tiptap'
import { useNavigate, useParams } from 'react-router-dom'
import pageServices from '../../services/pageServices'
import { useMutation, useQueryClient } from 'react-query'
import { updateContent } from './redux/pagesActions'
import pagesActionTypes from './redux/pagesActionTypes'
import './page.scss'

const EditPage = (props) => {

  const { tabs, pages } = useSelector((state) => {
    return {
      tabs: state.tabs,
      pages: state.pages,
    }
  })

  const saveTimeOut = useRef()
  const pageNameRef = useRef()

  const params = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const [warningModalFlag, setWarningModalFlag] = useState(false)
  const [pageContent, setPageContent] = useState('')

  const mutation = useMutation(updateContent, {
    onSuccess: (data) => {
      queryClient.setQueryData(['pageContent', params?.pageId], data?.contents || '')
      dispatch({ type: pagesActionTypes.UPDATE_PAGE_DATA, payload: { data: { state: isModified() ? 1 : tabs.tabs[params.pageId]?.state, name: data.name }, pageId: params.pageId } })
    }
  })

  const fetchPage = async () => {
    const data = await pageServices.getPageContent(params.orgId, params.pageId)
    setPageContent(data)
  }

  useEffect(() => {
    if (isModified()) return;
    fetchPage()
  }, [params.pageId])

  const handleChange = (value) => {
    if (!tabs[props.tab.id]?.activeTabId) tabService.markTabAsModified(props.tab.id)
    if (props.tab.id === tabs.activeTabId) {
      clearTimeout(saveTimeOut.current)
      saveTimeOut.current = setTimeout(() => {
        tabService.updateDraftData(props.tab.id, _.cloneDeep(value))
      }, 1000)
    }
  }

  const handleSubmit = () => {
    const contents = tabs.tabs[params.pageId]?.isModified ? tabs.tabs?.[params.pageId]?.draft : pageContent;
    const state = tabs.tabs[params.pageId]?.isModified ? 1 : pages[params.pageId].state;
    if (pageNameRef?.current?.value?.trim() === '') return toast.error('Page name cannot be empty.');
    if (contents === '<p></p>' || contents === '') contents = '';
    const editedPage = { name: pageNameRef.current.value, state, contents }
    mutation.mutate({ pageData: editedPage, id: params.pageId })
    tabService.markTabAsSaved(params.pageId)
    tabService.updateDraftData(params.pageId, null)
    navigate(`/orgs/${params.orgId}/dashboard/page/${params.pageId}`)
  }

  const handleCancel = () => {
    const pageId = params.pageId
    if (pageId) {
      tabService.unmarkTabAsModified(props.tab.id)
      navigate(`/orgs/${params.orgId}/dashboard/page/${pageId}`)
    }
  }

  const isModified = () => {
    return tabs.tabs[params.pageId]?.isModified
  }

  return (
    <div className='parent-page-display'>
      <div className='custom-edit-page page-display mt-3'>
        <div className='form-group'>
          <div className='d-flex justify-content-between align-items-center'>
            <label htmlFor='name'>Page Name</label>
            <div className='d-flex flex-row justify-content-end mb-2'>
              <button onClick={handleSubmit} type='submit' className='btn btn-primary btn-sm fs-4 mr-2'>
                Save
              </button>
              <button onClick={() => isModified() ? setWarningModalFlag(true) : handleCancel()} type='button' className='btn btn-secondary outline btn-sm fs-4'>
                Cancel
              </button>
              <WarningModal show={warningModalFlag} onHide={() => setWarningModalFlag(false)} ignoreButtonCallback={handleCancel} message='Your unsaved changes will be lost.' />
            </div>
          </div>
          <input key={params.pageId} ref={pageNameRef} name='name' id='name' defaultValue={pages?.[params.pageId]?.name} type='text' className='form-control' placeholder='Page Name' />
        </div>
        {console.log(isModified() ? tabs.tabs[params.pageId]?.draft : pageContent)}
        <Tiptap onChange={handleChange} initial={isModified() ? tabs.tabs[params.pageId]?.draft : pageContent} isInlineEditor={false} disabled={false} minHeight key={params.pageId} />
      </div>
    </div>
  )
}

export default EditPage
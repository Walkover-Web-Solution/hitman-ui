'use client'
import React, { useEffect, useRef, useState } from 'react'
import { IoSearchSharp } from "react-icons/io5";
import CustomModal from '@/components/customModal/customModal';
import { globalSearch } from '@/components/pages/pageApiService';
import './publicSearchBar.scss';

function SearchModal() {
  const searchBarRef = useRef(null);

  useEffect(() => {
    searchBarRef.current.focus();
  }, [])

  const handleSearchInputChange = async (e) => {
    e.preventDefault();
    const searchResults = await globalSearch(searchBarRef.current.value, sessionStorage.getItem('collectionId'));
  }

  return (
    <div className='p-3 public-search-modal'>
      <div className='d-flex justify-content-start align-items-center'>
        <IoSearchSharp size={22} />
        <input ref={searchBarRef} onChange={handleSearchInputChange} type="text" class="form-control mx-2" placeholder="Search here" />
      </div>
      <div className='break-line mt-3' />
    </div>
  )
}

export default function PublicSearchBar() {

  const [showSearchModal, setShowSearchModal] = useState(false);

  const openSearchModal = () => {
    setShowSearchModal(!showSearchModal);
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearchModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  return (
    <div className='public-search-bar mb-3'>
      <div onClick={openSearchModal} className="form-control d-flex justify-content-start align-items-center public-sidebar-input">
        Press ⌘ + K to search
      </div>
      <CustomModal onHide={openSearchModal} modalShow={showSearchModal}>
        <SearchModal />
      </CustomModal>
    </div>
  )
}
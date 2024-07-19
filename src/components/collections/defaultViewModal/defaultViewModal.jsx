import React, { Component } from 'react';
import shortid from 'shortid';
import Joi from 'joi-browser';
import './defaultViewModal.scss';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { onEnter, toTitleCase, validate } from '../../common/utility';
import Form from '../../common/form';
import { addPage } from '../../pages/redux/pagesActions';

export const defaultViewTypes = {
  TESTING: 'testing',
  DOC: 'doc'
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    add_page: (rootParentId, newPage) => dispatch(addPage(ownProps.history, rootParentId, newPage))
  };
};

export class DefaultViewModal extends Form {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      showPageForm: {
        addPage: false
      },
      data: {
        name: ''
      },
      errors: {
        name: ''
      }
    };

    this.schema = {
      name: Joi.string().min(1).max(100).required().label('Name'),
      contents: Joi.string().allow(null, ''),
      state: Joi.valid(0, 1, 2, 3)
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.doSubmit();
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showPageForm.addPage && !prevState.showPageForm.addPage) {
      if (this.inputRef.current) {
        this.inputRef.current.focus();
      }
    }
  }

  async doSubmit() {
    const errors = validate({ name: this.state.data.name }, this.schema);
    if (errors) {
      this.setState({ errors });
      return null;
    }
    if (!this.state.selectedCollection && this.props.addEntity) {
      this.setState({ versionRequired: true });
      return;
    }
    const collections = this.props?.selectedCollection;
    this.props.onHide();
    let { name } = { ...this.state?.data };
    name = toTitleCase(name);
    if (this.props.title === 'Add Parent Page' || this.props.addEntity) {
      const rootParentId = collections?.rootParentId;
      const data = { ...this.state.data, name };
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props.pageType === 1 ? shortid.generate() : null,
        pageType: this.props.pageType
      };
      this.props.add_page(rootParentId, newPage);
    }

    if (this.props?.title === 'Add Page' || this.props?.title === 'Add Sub Page' || this.props?.addEntity) {
      const selectedId = this.props?.title === 'Add Page' ? this.props?.selectedVersion : this.props?.selectedPage;
      const ParentId = selectedId;
      const data = { ...this.state.data };
      const newPage = {
        ...data,
        requestId: shortid.generate(),
        versionId: this.props?.pageType === 1 ? shortid.generate() : null,
        pageType: this.props?.pageType,
        state: 1
      };
      this.props.add_page(ParentId, newPage);
    }
  }

  renderCollectionDetailsForm() {
    return (
      <>
        <div className='dropdown-item p-0'>
          {this.renderInput('name', 'Name', this.props.title, 'Page name', false, false, '*name accepts min 1 & max 100 characters')}
        </div>
       {this.state.dropdownVisible && (
        <div className='dropdown-item  btn btn-primary btn-sm mt-2 fs-4' onClick={this.handleSubmit}>
          Submit
        </div>
           )}
      </>
    );
  }

  renderInModal() {
    return (
      <div
        className='dropdown-menu page-dropdown-menu'
        onKeyPress={(e) => {
          onEnter(e, this.handleKeyPress.bind(this));
        }}
      >
        <div className='dropdown-item p-0'>
          {this.renderInput('name', 'Name', this.props.title, 'Page name', false, false, '*name accepts min 1 & max 100 characters')}
        </div>
        <div className='btn btn-primary btn-sm mt-2 fs-4' onClick={this.handleSubmit}>
          Submit
        </div>
      </div>
    );
  }

  render() {
    return (
      <>
      <div
        className='dropdown-menu page-dropdown-menu'
        onKeyPress={(e) => {
          onEnter(e, this.handleKeyPress.bind(this));
        }}
      >
        <div className='dropdown-item p-0'>
          {this.renderInput('name', 'Name', this.props.title, 'Page name', false, false, '*name accepts min 1 & max 100 characters')}
        </div>
        <div className='btn btn-primary btn-sm mt-2 fs-4' onClick={this.handleSubmit}>
          Submit
        </div>
      </div>
      </>
    );
  }
}

export default withRouter(connect(null, mapDispatchToProps)(DefaultViewModal));

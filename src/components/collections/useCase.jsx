import React, { Component } from 'react'
import './useCase.scss'
import authService from '../auth/authService'

class UseCase extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      org: null,
      email: null,
      name: null,
      organisation: null,
      usertype: null
    }
  }

  componentDidMount () {
    const user = authService.getCurrentUser()
    const org = authService.getCurrentOrg()
    this.setState({ org, user })
    this.formSubmit()
  }

  formSubmit () {
    const submitButton = document.getElementsByClassName('button__ButtonWrapper-sc-1g3rldj-0 jzCLsm')
    submitButton.onclick = () => { console.log('clicked') }
    console.log(submitButton)
  }

  render () {
    // let url;
    // if(this.state.user && this.state.org)
    // {
    // let user= this.state.user;
    // let org=this.state.org;
    // let email=user.email;
    // let name=user.first_name?user.first_name+user.last_name:null;
    // let Organization=org.name;
    // let usertype='Organisation Admin'
    // url=`https://form.typeform.com/to/pMEUBYBP?typeform-medium=embed-snippet#email=${email}&name=${name}&organisation=${Organization}&usertype=${usertype}`
    // }
    return (
      <div>hello</div>
    //   <div>
    //     {/* {!this.state.user?.admin &&
    //     <a class="typeform-share button" href={url} data-mode="popup" data-open="load" data-size="50" data-submit-close-delay="0" target="_blank"> </a>
    //   } */}
    //     <a class='typeform-share button' href='https://form.typeform.com/to/AUalNOfP?typeform-medium=embed-snippet' data-mode='popup' data-size='100' target='_blank'>Launch me </a>
    //   </div>
    // )
    )
  }
}

export default UseCase

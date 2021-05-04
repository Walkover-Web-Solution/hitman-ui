import React from 'react'
import authService from '../auth/authService'
import { Modal } from 'react-bootstrap'
import Form from '../common/form'
import Joi from 'joi-browser'
import userFormInfoApiService from './userFormInfoApiService'

const options = {
  designation: ['Select', 'Executive', 'Administrator', 'Manager', 'CEO/Founder'],
  employee: ['Select', '1-10', '11-50', '51-100', '101-500', '500+'],
  industry: ['Select', 'IT Company', 'Telecommunication', 'Ecommerce', 'Education', 'Finance', 'Retail & FMCG', 'Others'],
  department: ['Select', 'Engineering', 'Product', 'Marketing', 'Sales', 'Operations', 'Support', 'QA', 'Others'],
  country: [
    'Select',
    'Afghanistan',
    'Albania',
    'Algeria',
    'American Samoa',
    'Andorra',
    'Angola',
    'Anguilla',
    'Antarctica',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Aruba',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas (the)',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bermuda',
    'Bhutan',
    'Bolivia (Plurinational State of)',
    'Bonaire, Sint Eustatius and Saba',
    'Bosnia and Herzegovina',
    'Botswana',
    'Bouvet Island',
    'Brazil',
    'British Indian Ocean Territory (the)',
    'Brunei Darussalam',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cayman Islands (the)',
    'Central African Republic (the)',
    'Chad',
    'Chile',
    'China',
    'Christmas Island',
    'Cocos (Keeling) Islands (the)',
    'Colombia',
    'Comoros (the)',
    'Congo (the Democratic Republic of the)',
    'Congo (the)',
    'Cook Islands (the)',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Curaçao',
    'Cyprus',
    'Czechia',
    "Côte d'Ivoire",
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic (the)',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Falkland Islands (the) [Malvinas]',
    'Faroe Islands (the)',
    'Fiji',
    'Finland',
    'France',
    'French Guiana',
    'French Polynesia',
    'French Southern Territories (the)',
    'Gabon',
    'Gambia (the)',
    'Georgia',
    'Germany',
    'Ghana',
    'Gibraltar',
    'Greece',
    'Greenland',
    'Grenada',
    'Guadeloupe',
    'Guam',
    'Guatemala',
    'Guernsey',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Heard Island and McDonald Islands',
    'Holy See (the)',
    'Honduras',
    'Hong Kong',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran (Islamic Republic of)',
    'Iraq',
    'Ireland',
    'Isle of Man',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jersey',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    "Korea (the Democratic People's Republic of)",
    'Korea (the Republic of)',
    'Kuwait',
    'Kyrgyzstan',
    "Lao People's Democratic Republic (the)",
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Macao',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands (the)',
    'Martinique',
    'Mauritania',
    'Mauritius',
    'Mayotte',
    'Mexico',
    'Micronesia (Federated States of)',
    'Moldova (the Republic of)',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Montserrat',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands (the)',
    'New Caledonia',
    'New Zealand',
    'Nicaragua',
    'Niger (the)',
    'Nigeria',
    'Niue',
    'Norfolk Island',
    'Northern Mariana Islands (the)',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine, State of',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines (the)',
    'Pitcairn',
    'Poland',
    'Portugal',
    'Puerto Rico',
    'Qatar',
    'Republic of North Macedonia',
    'Romania',
    'Russian Federation (the)',
    'Rwanda',
    'Réunion',
    'Saint Barthélemy',
    'Saint Helena, Ascension and Tristan da Cunha',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Martin (French part)',
    'Saint Pierre and Miquelon',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Sint Maarten (Dutch part)',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Georgia and the South Sandwich Islands',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan (the)',
    'Suriname',
    'Svalbard and Jan Mayen',
    'Sweden',
    'Switzerland',
    'Syrian Arab Republic',
    'Taiwan',
    'Tajikistan',
    'Tanzania, United Republic of',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tokelau',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Turks and Caicos Islands (the)',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates (the)',
    'United Kingdom of Great Britain and Northern Ireland (the)',
    'United States Minor Outlying Islands (the)',
    'United States of America (the)',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Venezuela (Bolivarian Republic of)',
    'Viet Nam',
    'Virgin Islands (British)',
    'Virgin Islands (U.S.)',
    'Wallis and Futuna',
    'Western Sahara',
    'Yemen',
    'Zambia',
    'Zimbabwe',
    'Åland Islands'
  ]
}
class UserFormInfo extends Form {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      org: null,
      data: {
        useCase: '',
        country: '',
        employee: '',
        designation: '',
        industry: '',
        department: ''
      },
      errors: {}
    }
  }

  schema = {
    useCase: Joi.string().required().label('Use Case'),
    country: Joi.string().required().label('Country'),
    employee: Joi.string().required().label('Number of employee'),
    designation: Joi.string().required().label('Designation'),
    industry: Joi.string().required().label('Industry'),
    department: Joi.string().required().label('Department')
  };

  componentDidMount () {
    const user = authService.getCurrentUser()
    const org = authService.getCurrentOrg()
    this.setState({ org, user })
  }

  handleValueChange (value, key) {
    const obj = { ...this.state.data }
    if (key !== 'useCase' && value === 'Select') { value = '' }
    obj[key] = value
    this.setState({ data: obj, errors: {} })
  }

  renderoptions (type, name) {
    return (
      <div className='form-group'>
        <label htmlFor={name} className='custom-input-label'>
          {name}
        </label>
        <select onChange={(e) => this.handleValueChange(e.currentTarget.value, type)} className='form-control custom-input' id={type} name={type}>
          {options[type].map((d, index) =>
            <option key={d} value={d}>{d}</option>
          )}
        </select>
        {this.state.errors[type] && (
          <div className='alert alert-danger'>{this.state.errors[type]}</div>
        )}
      </div>
    )
  }

  async doSubmit () {
    let obj = this.state.data
    const hiddenVars = this.state
    obj = {
      name: hiddenVars.user.first_name ? hiddenVars.user.first_name + ' ' + hiddenVars.user.last_name : null,
      organization: hiddenVars.org.name,
      email: hiddenVars.user.email,
      userType: 'Organization Admin',
      source: 'Hitman',
      ...obj
    }
    const response = await userFormInfoApiService.updateOrganization(this.state.org.identifier, { feedback_form_filled: true })
    await userFormInfoApiService.sendUserFormInfo(obj)
    this.props.onHide()
    const org = this.state.org
    org.feedback_form_filled = response.data.feedback_form_filled
    window.localStorage.setItem('organisation', JSON.stringify(org))
  }

  render () {
    const org = this.state.org
    return (
      <div>
        {org && org.org_user?.is_admin && !org.feedback_form_filled &&
          <Modal
            show={this.props.show}
            onHide={() => {}}
            size='md'
            animation={false}
            aria-labelledby='contained-modal-title-vcenter'
            centered
          >
            <Modal.Header>
              <Modal.Title id='contained-modal-title-vcenter'>
                Help us to serve you better!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={this.handleSubmit}>
                {this.renderInput('useCase', 'Use Case', 'Enter your use case')}
                {this.renderoptions('employee', 'Number of employees')}
                {this.renderoptions('designation', 'Designation')}
                {this.renderoptions('department', 'Department')}
                {this.renderoptions('industry', 'Industry')}
                {this.renderoptions('country', 'Country')}
                {this.renderButton('Submit')}
              </form>
            </Modal.Body>
          </Modal>}
      </div>
    )
  }
}

export default UserFormInfo

import React, { Component } from 'react'
import { Dropdown, Accordion, Card, Button } from 'react-bootstrap';
import { connect } from 'react-redux'
import { fetchFeedbacks} from './redux/publishDocsActions'

const mapStateToProps = (state) => {
  return {
    feedbacks: state.feedbacks
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_feedbacks: (collectionId) => dispatch(fetchFeedbacks(collectionId))
  }
}
class PublishDocsReview extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedItemType: 'endpoint',
      selectedItemId: null,
      filter: false
    }
  }

  componentDidMount() {
    const { collectionId } = this.props.match.params
    collectionId && this.props.fetch_feedbacks(collectionId)
  }

  componentDidUpdate(prevProps, prevState) {
    const { collectionId } = this.props.match.params
    if (prevProps.match.params.collectionId !== collectionId) {
      collectionId && this.props.fetch_feedbacks(collectionId)
    }
  }

  renderHostedApiHeading(heading) {
    return (
      <div className='page-title mb-3'>
        <div>{heading}</div>
      </div>
    )
  }

  renderFeedback() {
    const { feedbacks, pages } = this.props;
    console.log(feedbacks);
    return (
      <div className="feedback-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Positive Count</th>
              <th>Negative Count</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback, index) => (
              <tr key={index}>
                <td>{pages[feedback.pageId] ? pages[feedback.pageId].name : 'Unknown Page'}</td>
                <td>{feedback.positiveCount}</td>
                <td>{feedback.negativeCount}</td>
                <td>
                  {Object.keys(feedback.comments).length === 0 ? (
                    <div>No comments</div>
                  ) : (
                    // Use Accordion for multiple comments
                    <Accordion defaultActiveKey="0">
                      <Card>
                        <Card.Header className='p-0'>
                          <Accordion.Toggle as={Button}  variant="link" eventKey="1">
                            Show Comments
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="1">
                          <Card.Body>
                            {Object.entries(feedback.comments).map(([email, comments], idx) => (
                              <div key={email}>
                                <strong>Email: {email}</strong>
                                <br />
                                Comments: {comments.map(comment => <><br/>{comment}</>)}
                              </div>
                            ))}
                          </Card.Body>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  renderNoFeedback() {
    return <div>No feedbacks received</div>
  }

  render() {
    const feedbacks = this.props.feedbacks  || []
    return (
      <div className='feedback-tab'>
        <div className='d-flex flex-row'>
          {this.renderHostedApiHeading('API Doc Feedback')}
        </div>
        {feedbacks.length > 0 ? this.renderFeedback() : this.renderNoFeedback()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublishDocsReview)

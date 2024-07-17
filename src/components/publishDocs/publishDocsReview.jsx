import React, { useEffect } from 'react'
import { Accordion, Card, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeedbacks } from './redux/publishDocsActions'
import { useParams } from 'react-router-dom'

const PublishDocsReview = () => {
  const { collectionId } = useParams()
  const dispatch = useDispatch()

  const feedbacks = useSelector((state) => state.feedbacks)
  const pages = useSelector((state) => state.pages)

  useEffect(() => {
    if (collectionId) {
      dispatch(fetchFeedbacks(collectionId))
    }
  }, [collectionId, dispatch])

  const renderHostedApiHeading = (heading) => (
    <div className='page-title mb-3'>
      <div>{heading}</div>
    </div>
  )

  const renderFeedback = () => {
    return (
      <div className='feedback-table-container'>
        <table className='table'>
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
                <td>{pages[feedback?.pageId] ? pages[feedback?.pageId]?.name : 'Unknown Page'}</td>
                <td>{feedback?.positiveCount}</td>
                <td>{feedback?.negativeCount}</td>
                <td>
                  {Object.keys(feedback.comments).length === 0 ? (
                    <div>No comments</div>
                  ) : (
                    <Accordion defaultActiveKey='0'>
                      <Card>
                        <Card.Header className='p-0'>
                          <Accordion.Toggle as={Button} variant='link' eventKey='1'>
                            Show Comments
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey='1'>
                          <Card.Body>
                            {Object.entries(feedback.comments).map(([email, comments]) => (
                              <div key={email}>
                                <strong>Email: {email}</strong>
                                <br />
                                Comments: {comments.map((comment, idx) => (
                                  <React.Fragment key={idx}>
                                    <br />
                                    {comment}
                                  </React.Fragment>
                                ))}
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
  };

  const renderNoFeedback = () => <div>No feedbacks received</div>;

  return (
    <div className='feedback-tab'>
      <div className='d-flex flex-row'>
        {renderHostedApiHeading('API Doc Feedback')}
      </div>
      {feedbacks.length > 0 ? renderFeedback() : renderNoFeedback()}
    </div>
  );
};

export default PublishDocsReview;

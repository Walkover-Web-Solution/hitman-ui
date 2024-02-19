import WebSocketClient from 'rtlayer-client'
import {store} from '../../store/store'
import { onParentPageAdded } from '../../components/pages/redux/pagesActions';
import { onCollectionAdded } from '../../components/collections/redux/collectionsActions';

var client;

export function initConn(_channel) {
  console.log('came to initConn', _channel)
client = new WebSocketClient(process.env.REACT_APP_RTLAYER_OID, process.env.REACT_APP_RTLAYER_SID);
client.on('open', subscribe(_channel))
client.on('message', handleMessage)
}

export function resetConn(channel){
  console.log('came to resetConn')
client.unsubscribe(channel);
}

const subscribe = (channel) => {
client.subscribe(channel);
}

const handleMessage = (message) => {
  console.log("message == ",message)

  switch(message.operation) {
    case 'CollectionCreate':
    if(message.operation == 'CollectionCreate'){
      store.dispatch(onCollectionAdded(message.data))
      const inivisiblePageData = {
        page: {
          id: response.data.rootParentId,
          type: 0,
          child: []
        }
      }
      store.dispatch(onParentPageAdded(inivisiblePageData))
      console.log('came here to CollectionCreate', message)
    }

  default:
    // code block
  }
 
}
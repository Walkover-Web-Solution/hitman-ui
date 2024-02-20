import WebSocketClient from 'rtlayer-client'
import { store } from '../../store/store'
import { onParentPageAdded } from '../../components/pages/redux/pagesActions';
import { onCollectionAdded } from '../../components/collections/redux/collectionsActions';

var CLIENT, CHANNEL;

export function initConn(channel) {
  CHANNEL = channel;
  CLIENT = new WebSocketClient(process.env.REACT_APP_RTLAYER_OID, process.env.REACT_APP_RTLAYER_SID);
  if (CHANNEL) {
    CLIENT.on('open', subscribe)
    CLIENT.on('message', handleMessage)
  }
}

export function resetConn(channel) {
  CLIENT.unsubscribe(channel || CHANNEL);
}

const subscribe = () => {
  CLIENT.subscribe(CHANNEL);
}

const handleMessage = (message) => {
  message = JSON.parse(message)

  // api already updated the redux state don't update it again 
  if(message?.uniqueTabId == sessionStorage.getItem('uniqueTabId')){
    return ;
  }

  switch (message.operation) {
    case 'collection-create':
      store.dispatch(onCollectionAdded(message.data))
      const inivisiblePageData = {
        page: {
          id: message.data.rootParentId,
          type: 0,
          child: [],
          collectionId: message.data.id
        }
      }
      store.dispatch(onParentPageAdded(inivisiblePageData))

    default:
    // code block
  }

}
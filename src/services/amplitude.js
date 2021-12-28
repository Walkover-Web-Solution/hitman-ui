import amplitude from 'amplitude-js'

export function initAmplitude () {
  amplitude.getInstance().init(process.env.REACT_APP_AMPLITUDE_KEY, null, {
    saveEvents: true,
    includeUtm: true,
    includeReferrer: true
  })
};

export function setAmplitudeUserDevice (installationToken) {
  amplitude.getInstance().setDeviceId(installationToken)
};

export function setAmplitudeUserId (userId) {
  amplitude.getInstance().setUserId(userId)
};

export function setAmplitudeUserPropertie (properties) {
  amplitude.getInstance().setUserProperties(properties)
};

export function sendAmplitudeData (event, eventProperties) {
  eventProperties ? (amplitude.getInstance().logEvent(event, eventProperties)) : amplitude.getInstance().logEvent(event)
};

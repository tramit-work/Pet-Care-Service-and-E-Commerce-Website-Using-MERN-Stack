function parseUserAgent(uaString) {
  if (!uaString) {
    return { browser: 'Không xác định', os: 'Không xác định' };
  }

  let browser = 'Không xác định';
  if (/Edg\//.test(uaString)) browser = 'Microsoft Edge';
  else if (/OPR\//.test(uaString)) browser = 'Opera';
  else if (/Chrome\//.test(uaString)) browser = 'Google Chrome';
  else if (/Firefox\//.test(uaString)) browser = 'Mozilla Firefox';
  else if (/Safari\//.test(uaString)) browser = 'Safari';

  let os = 'Không xác định';
  if (/Windows NT/.test(uaString)) os = 'Windows';
  else if (/iPhone|iPad|iOS/.test(uaString)) os = 'iOS';
  else if (/Mac OS X/.test(uaString)) os = 'macOS';
  else if (/Android/.test(uaString)) os = 'Android';
  else if (/Linux/.test(uaString)) os = 'Linux';

  return { browser, os };
}

module.exports = { parseUserAgent };

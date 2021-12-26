function makeStr(len) {
  len = len || 12; // 12 characters long by default
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2)
}

export function randomString(len){
  let arr = new Uint8Array((len || 12) / 2); // 12 characters long by default
  if (window.crypto){
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join('')
  } else {
    return makeStr(len)
  }
}

export function formatFileSize(size) {
  let i = -1;
  const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
  do {
    size /= 1024;
    i++;
  } while (size > 1024);
  return Math.max(size, 0.1).toFixed(1) + byteUnits[i];
};

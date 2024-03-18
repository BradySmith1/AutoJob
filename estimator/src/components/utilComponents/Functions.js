/**
 * This function was taken from w3schools
 * https://www.w3schools.com/js/js_cookies.asp
 * 
 * Get a cookie based off of a name
 * 
 * @param {String} cname 
 * @returns String, cookie
 */
export const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
/*
 * ProfitizeHub site snippet: counts a site's pageviews for its project's card
 * on the Launchpad. Add it to the site's <head>:
 *
 *   <script defer src="https://<ProfitizeHub>/t.js" data-site="<site key>"></script>
 *
 * No cookies and no storage. It sends the page address (the server keeps the
 * path only) and the referrer, and stays quiet on localhost and in automated
 * browsers. Plain ES5 (catch needs its binding), so it parses everywhere.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
;(function () {
  var script = document.currentScript
  var key = script && script.getAttribute("data-site")
  if (!key) return
  var host = location.hostname
  if (
    navigator.webdriver ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]"
  ) {
    return
  }
  var endpoint = new URL("/api/collect", script.src).href
  var last = null

  function send() {
    var url = location.href.split("#")[0]
    if (url === last) return
    // After the first page, the referrer is the page the visitor came from.
    var body = JSON.stringify({
      k: key,
      u: url,
      r: last || document.referrer || null,
    })
    last = url
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return
    } catch (e) {}
    try {
      fetch(endpoint, {
        method: "POST",
        body: body,
        keepalive: true,
        mode: "no-cors",
        credentials: "omit",
      })
    } catch (e) {}
  }

  // Single-page apps change pages with pushState; Back and Forward fire popstate.
  var pushState = history.pushState
  history.pushState = function () {
    var result = pushState.apply(this, arguments)
    send()
    return result
  }
  addEventListener("popstate", send)
  send()
})()

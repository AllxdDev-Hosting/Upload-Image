const $ = el => {
   return document.getElementById(el)
}

function upload() {
   var file = $('someFiles').files[0]
   var formdata = new FormData()
   formdata.append('someFiles', file)
   var ajax = new XMLHttpRequest()
   ajax.upload.addEventListener('progress', progressHandler, false)
   ajax.addEventListener('load', completeHandler, false)
   ajax.addEventListener('error', errorHandler, false)
   ajax.addEventListener('abort', abortHandler, false)
   ajax.open('POST', '/upload')
   ajax.send(formdata)
}

function progressHandler(event) {
   const progressBar = $('progressBar');
   var percent = (event.loaded / event.total) * 100
   progressBar.style.width = percent + '%';
   // $('progress').innerHTML = 'Please wait ... ' + Math.round(percent) + '%'
}

function completeHandler(event) {
   if (/complete/i.test(event.target.responseText)) {
      var id = event.target.responseText.split(':')[1].trim()
      window.location = '/file/' + id
   } else {
      alert(event.target.responseText)
      setTimeout(function () {
         const progressBar = $('progressBar');
         progressBar.style.width = '0%';
      }, 500)
   }
}

function errorHandler(event) {
   alert('Something went wrong!')
   setTimeout(function () {
      const progressBar = $('progressBar');
      progressBar.style.width = '0%';
   }, 500)
}

function abortHandler(event) {
   alert('Upload aborted!')
   setTimeout(function () {
      const progressBar = $('progressBar');
      progressBar.style.width = '0%';
   }, 500)
}

function timeout(ms) {
   var target_date = ms
   var days, hours, minutes, seconds
   var countdown = document.getElementById('countdown')

   setInterval(function () {
      var current_date = new Date().getTime()
      var seconds_left = (target_date - current_date) / 1000
      days = parseInt(seconds_left / 86400)
      seconds_left = seconds_left % 86400
      hours = parseInt(seconds_left / 3600)
      seconds_left = seconds_left % 3600
      minutes = parseInt(seconds_left / 60)
      seconds = parseInt(seconds_left % 60)
      var d = days < 10 ? "0" + days : days,
         h = hours < 10 ? "0" + hours : hours,
         m = minutes < 10 ? "0" + minutes : minutes,
         s = seconds < 10 ? "0" + seconds : seconds
      countdown.innerHTML = d + ":" + h + ":" + m + ":" + s
   }, 1000)
}
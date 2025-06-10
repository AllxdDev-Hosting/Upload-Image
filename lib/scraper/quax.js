import axios from 'axios'
import FormData from 'form-data'

export default (buffer, fname) => new Promise(async resolve => {
    try {
       let form = new FormData
       form.append('files[]', buffer, fname)
       form.append('expiry', '-1')
       const json = await (await axios.post('https://qu.ax/upload.php', form, {
          headers: {
             'Origin': 'https://qu.ax',
             'Referer': 'https://qu.ax/',
             ...form.getHeaders(),
             'user-agent': 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
          }
       })).data
       if (!json.success) return resolve({
          creator: global.creator,
          status: false,
          msg: `Upload failed!`
       })
       resolve({
          creator: global.creator,
          status: true,
          data: json.files[0]
       })
    } catch (e) {
       // console.error(e)
       resolve({
          creator: global.creator,
          status: false,
          msg: e.message
       })
    }
 })
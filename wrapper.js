import FormData from 'form-data'
import axios from 'axios'
import pkg from 'file-type'
const { fromBuffer: parse } = pkg
import fs from 'fs'

class OpenAPI {
   constructor() {
      this.baseUrl = 'https://4uxwh7kl-05w3jf73-ly4qidtx3dfc.acb2-preview.marscode.dev' // your domain
   }

   isUrl(url) {
      try {
         new URL(url)
         return true
      } catch (e) {
         return false
      }
   }

   upload = (i, extension) => new Promise(async (resolve, reject) => {
      try {
         if (!Buffer.isBuffer(i) && !this.isUrl(i)) return resolve({
            status: false,
            msg: 'only buffer and url formats are allowed'
         })
         const file = Buffer.isBuffer(i) ? i : this.isUrl(i) ? await (await axios.get(i, {
            responseType: 'arraybuffer'
         })).data : null
         let form = new FormData
         try {
            var { ext } = await parse(file)
         } catch (e) {
            var ext = 'txt'
         }
         form.append('someFiles', Buffer.from(file), 'file.' + (extension || ext))
         const json = await (await axios.post(this.baseUrl + '/api/upload', form, {
            headers: {
               ...form.getHeaders()
            }
         })).data
         resolve(json)
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e?.response.data?.msg || e.message
         })
      }
   })

   extended = (i, extension) => new Promise(async (resolve, reject) => {
      try {
         if (!Buffer.isBuffer(i) && !this.isUrl(i)) return resolve({
            status: false,
            msg: 'only buffer and url formats are allowed'
         })
         const file = Buffer.isBuffer(i) ? i : this.isUrl(i) ? await (await axios.get(i, {
            responseType: 'arraybuffer'
         })).data : null
         let form = new FormData
         try {
            var { ext } = await parse(file)
         } catch (e) {
            var ext = 'txt'
         }
         form.append('someFiles', Buffer.from(file), 'file.' + (extension || ext))
         form.append('expiry', -1)
         form.append('apikey', 'neoxr')
         const json = await (await axios.post(this.baseUrl + '/api/upload', form, {
            headers: {
               ...form.getHeaders()
            }
         })).data
         resolve(json)
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e?.response.data?.msg || e.message
         })
      }
   })

   short = url => new Promise(async (resolve, reject) => {
      try {
         let form = new URLSearchParams
         form.append('url', url)
         const json = await (await axios.post(this.baseUrl + '/api/short', form)).data
         resolve(json)
      } catch (e) {
         resolve({
            creator,
            status: false,
            msg: e?.response.data?.msg || e.message
         })
      }
   })
}

const p = new OpenAPI
p.extended(fs.readFileSync('./index.js')).then(console.log)
import fs from 'fs'
import { Func, Loader } from '../../lib/index.js'
import formidable from 'formidable'
const Scraper = Loader.scrapers

export const routes = {
   category: 'open-api',
   path: '/api/upload-external',
   method: 'post',
   execution: async (req, res, next) => {
      const form = new formidable.IncomingForm()
      const MAX_UPLOAD_SIZE = 1

      form.parse(req, async (err, fields, files) => {
         if (typeof files.file === 'undefined') {
            return res.status(400).json({
               creator: global.creator,
               status: false,
               msg: `File not found!`
            })
         }

         const chSize = Func.sizeLimit(Func.formatSize(files.file.size), MAX_UPLOAD_SIZE)
         if (chSize.oversize) {
            return res.json({
               creator: global.creator,
               status: false,
               msg: `Max file size is ${MAX_UPLOAD_SIZE}MB!`
            })
         }

         const id = Func.makeId(6)
         const extension = files.file.originalFilename.split('.')[files.file.originalFilename.split('.').length - 1]
         const fname = `${id}.${extension}`
         const streamFile = fs.createReadStream(files.file.filepath)
         const json = await Scraper.quax(streamFile, fname)
         res.json(json)
      })
   },
   error: false
}


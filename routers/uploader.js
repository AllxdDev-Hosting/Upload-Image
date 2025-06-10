import { Func } from '../lib/index.js'
import formidable from 'formidable'
import mv from 'mv'

export const routes = {
   category: 'main',
   path: '/upload',
   method: 'post',
   execution: async (req, res, next) => {
      const form = formidable({})
      form.parse(req, async (err, fields, files) => {
         // name = "someFiles"
         if (typeof files.someFiles == 'undefined') return res.end('File not found')
         const chSize = Func.sizeLimit(Func.formatSize(files.someFiles.size), process.env.MAX_UPLOAD_SIZE)
         if (chSize.oversize) return res.end(`Max file size is ${process.env.MAX_UPLOAD_SIZE}MB!`)
         const id = Func.makeId(4)
         const expired = (new Date * 1) + 3600000
         const extension = files.someFiles.originalFilename.split `.` [files.someFiles.originalFilename.split `.`.length - 1]
         const fname = id + '.' + extension
         const oldpath = files.someFiles.filepath
         const newpath = 'public/' + process.env.FILE_PATH + '/' + fname
         mv(oldpath, newpath, async function (err) {
            if (err) {
               res.end(err.message)
            } else {
               await global.db.insert('uploader', {
                  code: id,
                  filename: fname,
                  bytes: files.someFiles.size,
                  size: Func.formatSize(files.someFiles.size),
                  expired_at: expired
               })
               res.end('Upload completed : ' + id)
               // res.redirect(`${req.protocol + '://' + req.get('Host')}/${process.env.FILE_PATH}/${fname}`)
            }
         })
      })
   },
   error: false
}
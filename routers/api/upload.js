import { Func } from '../../lib/index.js'
import formidable from 'formidable'
import mv from 'mv'

export const routes = {
   category: 'open-api',
   path: '/api/upload',
   method: 'post',
   execution: async (req, res, next) => {
      const form = formidable({})
      form.parse(req, async (err, fields, files) => {
         if (typeof files.someFiles == 'undefined') return res.status(400).json({
            creator: global.creator,
            status: false,
            msg: `File not found!`
         })
         if (fields.expiry && !fields.apikey) return res.status(401).json({
            creator: global.creator,
            status: false,
            msg: `Provide apikey to upload extended file`
         })
         if (fields.expiry && fields.apikey && fields.apikey !== process.env.API_KEY) return res.status(401).json(global.status.invalidKey)
         const chSize = Func.sizeLimit(Func.formatSize(files.someFiles.size), process.env.MAX_UPLOAD_SIZE)
         if (chSize.oversize) return res.status(400).json({
            creator: global.creator,
            status: false,
            msg: `Max file size is ${process.env.MAX_UPLOAD_SIZE}MB!`
         })
         const id = Func.makeId(6)
         const expired = (new Date * 1) + 3600000
         const extension = files.someFiles.originalFilename.split`.`[files.someFiles.originalFilename.split`.`.length - 1]
         const fname = id + '.' + extension
         const oldpath = files.someFiles.filepath
         const newpath = 'public/' + process.env.FILE_PATH + '/' + fname
         mv(oldpath, newpath, async function (err) {
            if (err) {
               res.json({
                  creator: global.creator,
                  status: false,
                  msg: err.message
               })
            } else {
               await global.db.insert('uploader', {
                  code: id,
                  filename: fname,
                  bytes: files.someFiles.size,
                  size: Func.formatSize(files.someFiles.size),
                  expired_at: fields.expiry || expired
               })
               res.json({
                  creator: global.creator,
                  status: true,
                  data: {
                     ...(fields.expiry ? {} : {
                        page: `${req.protocol + 's://' + req.get('Host')}/file/${id}`
                     }),
                     url: `${req.protocol + 's://' + req.get('Host')}/${process.env.FILE_PATH}/${fname}`
                  }
               })
            }
         })
      })
   },
   error: false
}
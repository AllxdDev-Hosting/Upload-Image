import { Func } from '../lib/index.js'

export const routes = {
   category: 'main',
   path: '/',
   method: 'get',
   execution: async (req, res, next) => {
      const files = await global.db.fetch('uploader')
      let size = 0
      files.map(v => size += v.bytes)
      res.render(process.cwd() + '/public/index', {
         title: process.env.SITENAME,
         data: {
            total_files: files.length,
            total_size: Func.formatSize(size)
         },
         header: process.env.SITENAME
      })
   },
   error: false
}
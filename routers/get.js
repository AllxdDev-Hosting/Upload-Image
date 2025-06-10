export const routes = {
   category: 'main',
   path: '/file/:hash',
   method: 'get',
   execution: async (req, res, next) => {
      const { hash } = req.params
      const check = await global.db.select('uploader', '*', `code = "${hash}"`)
      if (!check.length) return res.status(404).json({
         creator: global.creator,
         status: false,
         msg: 'File not found'
      })
      res.render(process.cwd() + '/public/detail', {
         title: check[0].filename + ' | ' + process.env.SITENAME,
         header: process.env.SITENAME,
         data: check[0],
         domain: req.protocol + 's://' + req.get('Host') + '/',
         path: process.env.FILE_PATH
      })
   },
   error: false
}
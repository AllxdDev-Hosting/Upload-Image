export const routes = {
   category: 'main',
   path: '/s/:hash',
   method: 'get',
   execution: async (req, res, next) => {
      const { hash } = req.params
      const check = await global.db.select('shorten', 'url', `code = "${hash}"`)
      if (!check.length) return res.status(404).json({
         creator: global.creator,
         status: false,
         msg: 'Url not found'
      })
      res.redirect(check[0].url)
   },
   error: false
}
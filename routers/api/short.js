import { Func } from '../../lib/index.js'

export const routes = {
   category: 'open-api',
   path: '/api/short',
   parameter: ['url'],
   method: 'post',
   execution: async (req, res, next) => {
      const id = Func.makeId(6)
      const expired = (new Date * 1) + 3600000
      await global.db.insert('shorten', {
         code: id,
         url: req.body.url,
         expired_at: expired
      })
      res.json({
         creator: global.creator,
         status: true,
         data: {
            origin: req.body.url,
            url: `${req.protocol + 's://' + req.get('Host')}/s/${id}`
         }
      })
   },
   error: false
}
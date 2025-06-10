import { Loader, Func } from './lib/index.js'
import { collection, allowedIPs } from './lib/system/config.js'
import requestIp from 'request-ip'
import path, { dirname } from 'path'
import express from 'express'
import { fileURLToPath } from 'url'
const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createRouter = async () => {
   try {
      await Loader.router(path.join(__dirname, 'routers'))
      const routers = Object.values(Object.fromEntries(Object.entries(Loader.plugins)))
      routers.some((v, index) => {
         const route = v.routes
         if (route.name) {
            collection.push({
               category: Func.ucword(route.category),
               base_code: Buffer.from(route.category.toLowerCase()).toString('base64'),
               name: route.name,
               path: route.example ? `${route.path}?${new URLSearchParams(route.example).toString('utf-8')}` : route.path,
               method: route.method.toUpperCase(),
               raw: {
                  path: route.path,
                  example: route.example || null
               },
               error: route.error,
               premium: route.premium
            })
         }

         // restriction
         const restrict = route.restrict ? (req, res, next) => {
            const userIP = requestIp.getClientIp(req)
            if (!allowedIPs.includes(userIP)) return res.status(403).json({
               creator: global.creator,
               status: false,
               msg: 'Your ip is not allowed to access this page'
            })
            next()
         } : (req, res, next) => {
            next()
         }

         // error
         const error = route.error ? (req, res, next) => {
            res.json({
               creator: global.creator,
               status: false,
               msg: `Sorry, this feature is currently error and will be fixed soon`
            })
         } : (req, res, next) => {
            next()
         }

         // validator & requires
         const requires = !route.requires ? (req, res, next) => {
            const reqFn = route.method === 'get' ? 'reqGet' : 'reqPost'
            const check = global.status[reqFn](req, route.parameter)
            if (!check.status) return res.json(check)
            const reqType = route.method === 'get' ? 'query' : 'body'
            if ('url' in req[reqType]) {
               const isUrl = global.status.url(req[reqType].url)
               if (!isUrl.status) return res.json(isUrl)
               next()
            } else next()
         } : route.requires

         // custom validator
         const validator = route.validator ? route.validator : (req, res, next) => {
            next()
         }

         router[route.method](route.path, restrict, error, requires, validator, route.execution)
         if (router.stack.length === routers.length || (router.stack.length - 1) === routers.length) return
      })
      return router
   } catch (e) {
      console.log(e)
   }
}

export default createRouter()

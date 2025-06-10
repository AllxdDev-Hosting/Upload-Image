import 'dotenv/config'
import './lib/system/config.js'
import { Loader } from './lib/index.js'
import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import chalk from 'chalk'
import requestIp from 'request-ip'
import morgan from 'morgan'
import fs from 'fs'
import os from 'node:os'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readdir, stat, rm, unlink } from 'fs/promises'
import CFonts from 'cfonts'
import ejs from 'ejs'
import cors from 'cors'
import SQL from './lib/system/sql.js'
global.db = new SQL('./' + process.env.DATABASE + '.db') // Create a new instance of SQLiteDatabase
const PORT = process.env.PORT || 3000

// process.on('uncaughtException', (error) => console.log(error.message))

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const clearTmp = async (dirPath) => {
   try {
      const files = await readdir(dirPath)
      await Promise.all(
         files.map(async (file) => {
            const filePath = join(dirPath, file)
            const fileStat = await stat(filePath)
            if (fileStat.isDirectory()) {
               await rm(filePath, { recursive: true, force: true })
            } else {
               await unlink(filePath)
            }
         })
      )
      console.log(`Folder ${dirPath} berhasil dibersihkan`)
   } catch (error) {
      console.error(`Gagal membersihkan folder ${dirPath}:`, error.message)
   }
}

const runServer = async () => {
   if (!fs.existsSync('./public/' + process.env.FILE_PATH)) fs.mkdirSync('./public/' + process.env.FILE_PATH)
   if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')
   await Loader.scraper('./lib/scraper')

   // Create the "uploader" table if it doesn't exist
   await global.db.createTable('uploader', [
      { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
      { name: 'code', type: 'TEXT' },
      { name: 'filename', type: 'TEXT' },
      { name: 'bytes', type: 'INTEGER' },
      { name: 'size', type: 'TEXT' },
      { name: 'expired_at', type: 'INTEGER' }
   ])

   // Create the "shorten" table if it doesn't exist
   await global.db.createTable('shorten', [
      { name: 'id', type: 'INTEGER PRIMARY KEY AUTOINCREMENT' },
      { name: 'code', type: 'TEXT' },
      { name: 'url', type: 'TEXT' },
      { name: 'expired_at', type: 'INTEGER' }
   ])

   setInterval(async () => {
      try {
         await global.db.delete('shorten', 'expired_at <= ?', [Date.now()])
         const check = await global.db.fetch('uploader')
         if (check.length > 0) {
            for (const data of check) {
               if (data.expired_at > 0 && data.expired_at <= Date.now()) {
                  await global.db.delete('uploader', 'id = ?', [data.id])
                  fs.unlinkSync('./public/' + process.env.FILE_PATH + '/' + data.filename)
               }
            }
         }
      } catch { }
   }, 1000 * 5)

   setInterval(() => clearTmp(os.tmpdir()), 10 * 60 * 1000) // Setiap 10 menit

   const app = express()
   morgan.token('clientIp', (req) => req.clientIp)

   app.set('json spaces', 3)
      .set('view engine', 'ejs')
      .engine('ejs', ejs.__express)
      .use(express.json())
      .use(requestIp.mw())
      .use(morgan(':clientIp :method :url :status :res[content-length] - :response-time ms'))
      .use(bodyParser.json({ limit: '50mb' }))
      .use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
      .use(express.static(path.join(__dirname, 'public')))
      .use(cors({
         origin: '*', // Atau spesifik domain: 'http://localhost:3000'
         methods: ['GET', 'POST', 'PUT', 'DELETE'],
         // allowedHeaders: ['Content-Type', 'Authorization', 'X-Neoxr-Token']
      }))

   // Mengimpor handler secara dinamis
   const handler = await import('./handler.js')
   app.use('/', await handler.default)

   app.get('*', (req, res) => res.status(404).json({
      creator: global.creator,
      status: false,
      msg: 'the page you are looking for was not found'
   }))

   app.disable('x-powered-by')
   app.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'AllxdDev-Hosting')
      next()
   })

   app.listen(PORT, () => {
      // console.clear()
      CFonts.say('Open-API', {
         font: 'tiny',
         align: 'center',
         colors: ['system']
      })
      CFonts.say('Github : https://github.com/AllxdDev-Hosting', {
         colors: ['system'],
         font: 'console',
         align: 'center'
      })
      console.log(chalk.yellowBright.bold('Server listening on PORT --->', PORT))
   })
}

runServer().catch(() => runServer())
import { readdir as fsReaddir, stat as fsStat } from 'fs/promises'
import { resolve, basename } from 'path'

class Loader {
   constructor() {
      this.plugins = []
      this.scrapers = []
   }

   async scan(dir) {
      let subdirs = await fsReaddir(dir)
      let files = await Promise.all(subdirs.map(async (subdir) => {
         let res = resolve(dir, subdir)
         return (await fsStat(res)).isDirectory() ? this.scan(res) : res
      }))
      return files.flat()
   }

   async dynamicRequire(file) {
      try {
         const module = await import(file)
         return (typeof module === 'function' || (typeof module === 'object' && module !== null && module.constructor)) 
            ? new module()
            : module
      } catch (error) {
         console.error(`Failed to require the module from ${file}:`, error)
         return null
      }
   }

   async router(dir) {
      const files = await this.scan(dir)
      const pluginsArray = await Promise.all(
         files
            .filter(v => v.endsWith('.js'))
            .map(async file => {
               const plugin = await import(file)
               return [basename(file).replace('.js', ''), plugin.default || plugin]
            })
      )
      this.plugins = Object.fromEntries(pluginsArray)
   }

   async scraper(dir) {
      const files = await this.scan(dir)
      const scrapersArray = await Promise.all(
         files
            .filter(v => v.endsWith('.js'))
            .map(async file => {
               const scraper = await this.dynamicRequire(file)
               return [basename(file).replace('.js', ''), scraper.default || scraper]
            })
      )
      this.scrapers = Object.fromEntries(scrapersArray)
   }
}

export default new Loader

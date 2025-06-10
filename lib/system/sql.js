import sqlite3 from 'sqlite3'

class SQLiteDatabase {
   constructor(databasePath) {
      this.databasePath = databasePath
      this.db = new sqlite3.Database(this.databasePath, (err) => {
         if (err) {
            console.error('Error opening database:', err.message)
         } else {
            console.log('Connected to SQLite database.')
         }
      })
   }

   async createTable(tableName, columns) {
      try {
         const tableExistsQuery = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
         const tableExists = await new Promise((resolve, reject) => {
            this.db.get(tableExistsQuery, [tableName], (err, row) => {
               if (err) reject(err)
               resolve(!!row)
            })
         })

         if (tableExists) {
            // console.log(`Table "${tableName}" already exists. Skipping creation.`)
            return
         }

         const columnsDef = columns.map(col => `${col.name} ${col.type}`).join(', ')
         const query = `CREATE TABLE ${tableName} (${columnsDef})`

         await new Promise((resolve, reject) => {
            this.db.run(query, (err) => {
               if (err) reject(err)
               resolve()
            })
         })
         // console.log(`Table "${tableName}" created successfully.`)
      } catch (error) {
         console.error(`Error creating table "${tableName}":`, error.message)
      }
   }

   async insert(tableName, data) {
      try {
         const columns = Object.keys(data).join(', ')
         const placeholders = Object.keys(data).map(() => '?').join(', ')
         const values = Object.values(data)
         const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`
         await this.run(sql, values)
         // console.log('Data inserted successfully.')
      } catch (error) {
         console.error('Error inserting data:', error.message)
      }
   }

   async select(tableName, columns = '*', condition = '') {
      try {
         const sql = `SELECT ${columns} FROM ${tableName} ${condition ? `WHERE ${condition}` : ''}`
         const rows = await this.all(sql)
         // console.log('Data retrieved successfully.')
         return rows
      } catch (error) {
         console.error('Error selecting data:', error.message)
      }
   }

   async update(tableName, data, condition) {
      try {
         const setClause = Object.keys(data)
            .map((key) => `${key} = ?`)
            .join(', ')
         const values = Object.values(data)
         const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${condition}`
         await this.run(sql, values)
         // console.log('Data updated successfully.')
      } catch (error) {
         console.error('Error updating data:', error.message)
      }
   }

   async delete(tableName, condition, conditionValues = []) {
      try {
         const query = `DELETE FROM ${tableName} WHERE ${condition}`
         await new Promise((resolve, reject) => {
            this.db.run(query, conditionValues, (err) => {
               if (err) reject(err)
               resolve()
            })
         })
         // console.log(`Rows deleted from table "${tableName}" where ${condition}`)
      } catch (error) {
         console.error(`Error deleting rows from table "${tableName}":`, error.message)
      }
   }   

   async deleteV2(tableName, condition) {
      try {
         const sql = `DELETE FROM ${tableName} WHERE ${condition}`
         await this.run(sql)
         // console.log('Data deleted successfully.')
      } catch (error) {
         console.error('Error deleting data:', error.message)
      }
   }

   async fetch(tableName) {
      try {
         const query = `SELECT * FROM ${tableName}`
         const rows = await new Promise((resolve, reject) => {
            this.db.all(query, (err, rows) => {
               if (err) reject(err)
               resolve(rows)
            })
         })
   
         if (rows.length === 0) {
            // console.log(`No data found in table "${tableName}".`)
            return []
         }
   
         // console.log(`Fetched all data from table "${tableName}":`, rows)
         return rows
      } catch (error) {
         console.error(`Error fetching data from table "${tableName}":`, error.message)
      }
   }   

   async dropTable(tableName) {
      try {
         const sql = `DROP TABLE IF EXISTS ${tableName}`
         await this.run(sql)
         // console.log(`Table "${tableName}" dropped successfully.`)
      } catch (error) {
         // console.error('Error dropping table:', error.message)
      }
   }

   run(sql, params = []) {
      return new Promise((resolve, reject) => {
         this.db.run(sql, params, function (err) {
            if (err) reject(err)
            else resolve(this)
         })
      })
   }

   all(sql, params = []) {
      return new Promise((resolve, reject) => {
         this.db.all(sql, params, (err, rows) => {
            if (err) reject(err)
            else resolve(rows)
         })
      })
   }

   async getAll(tableName) {
      try {
         const query = `PRAGMA table_info(${tableName})`
         const columns = await new Promise((resolve, reject) => {
            this.db.all(query, (err, rows) => {
               if (err) reject(err)
               resolve(rows)
            })
         })

         if (columns.length === 0) {
            // console.log(`Table "${tableName}" does not exist or has no columns.`)
            return []
         }

         return columns
      } catch (error) {
         console.error(`Error fetching columns for table "${tableName}":`, error.message)
         
      }
   }

   close() {
      return new Promise((resolve, reject) => {
         this.db.close((err) => {
            if (err) {
               console.error('Error closing database:', err.message)
               reject(err)
            } else {
               console.log('Database connection closed.')
               resolve()
            }
         })
      })
   }
}

export default SQLiteDatabase
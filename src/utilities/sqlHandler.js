const db = require('sqlite3')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let database = new db.Database('./database.db', (err) => {
    if (err) {
        console.log(err)
    }
    console.log("Connected")
    }
)

database.query = function (sql, params) { //Stolen function from the internet because I need promises thanks https://blog.pagesd.info/2019/10/29/use-sqlite-node-async-await/
    var that = this
    return new Promise(function (resolve, reject) {
        that.all(sql, params, function (error, rows) {
            if (error) reject(error)
            else resolve(rows)
        })
    })
}

const SQLHandler = {
    init: async () => {
        const tables = await database.query(`SELECT name FROM sqlite_schema WHERE type='table' and name not like 'sqlite_%'`, [])
        if (tables.length != 0) {
            return
        }
        database.run(`PRAGMA foreign_keys = OFF`)
        await delay(1000)
        database.run(`CREATE TABLE IF NOT EXISTS teams (
            name TEXT PRIMARY KEY NOT NULL,
            user1 TEXT DEFAULT NULL,
            user2 TEXT DEFAULT NULL,
            user3 TEXT DEFAULT NULL,
            FOREIGN KEY (user1) REFERENCES users(name) ON DELETE SET NULL,
            FOREIGN KEY (user2) REFERENCES users(name) ON DELETE SET NULL,
            FOREIGN KEY (user3) REFERENCES users(name) ON DELETE SET NULL
        )`)
        database.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            eventNotifs INTEGER NOT NULL DEFAULT 1,
            scrimsNotifs INTEGER NOT NULL DEFAULT 0,
            team TEXT DEFAULT NULL,
            FOREIGN KEY (team) REFERENCES teams(name) ON DELETE SET NULL
        )`)
        database.run(`PRAGMA foreign_keys = ON`)
    }
}

module.exports = SQLHandler
const db = require("sqlite3");
const logger = require("./logger");
const brawl = require("./brawlApi");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let database = new db.Database("./database.db", (err) => {
  if (err) {
    logger.error(err);
  }
  logger.info("Connected to SQLite database");
});

database.query = function (sql, params) {
  //Stolen function from the internet because I need promises thanks https://blog.pagesd.info/2019/10/29/use-sqlite-node-async-await/
  let that = this;
  return new Promise(function (resolve, reject) {
    that.all(sql, params, function (error, rows) {
      if (error) reject(error);
      else resolve(rows);
    });
  });
};
database.execute = function (sql, params) {
  let that = this;
  return new Promise(function (resolve, reject) {
    that.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve();
    });
  });
};

const SQLHandler = {
  init: async () => {
    const tables = await database.query(
      `SELECT name FROM sqlite_schema WHERE type='table' and name not like 'sqlite_%'`,
      []
    );
    if (tables.length !== 0) {
      return;
    }
    database.run(`PRAGMA foreign_keys = OFF`);
    await delay(1000);
    await database.execute(`CREATE TABLE IF NOT EXISTS teams (
            name TEXT PRIMARY KEY NOT NULL,
            roleid TEXT NOT NULL DEFAULT 0,
            user1 TEXT DEFAULT "Nobody",
            user2 TEXT DEFAULT "Nobody",
            user3 TEXT DEFAULT "Nobody",
            FOREIGN KEY (user1) REFERENCES users(name) ON DELETE SET DEFAULT,
            FOREIGN KEY (user2) REFERENCES users(name) ON DELETE SET DEFAULT,
            FOREIGN KEY (user3) REFERENCES users(name) ON DELETE SET DEFAULT
        )`);
    await database.execute(`INSERT INTO teams (name) VALUES ("No Team")`);
    await database.execute(`CREATE TABLE IF NOT EXISTS users (
            tag TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            discordId TEXT,
            eventNotifs INTEGER NOT NULL DEFAULT 1,
            scrimsNotifs INTEGER NOT NULL DEFAULT 0,
            team TEXT DEFAULT "No Team",
            FOREIGN KEY (team) REFERENCES teams(name) ON DELETE SET DEFAULT
        )`);
    await database.execute(
      `INSERT INTO users (tag, name) VALUES ("Nobody", "Nobody")`
    );
    await database.execute(`CREATE TABLE IF NOT EXISTS states (
            name TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL
        )`);
    await database.execute(
      `INSERT INTO states (name, value) VALUES ("weekType", "league")`
    );
  },
  regentables: async () => {
    await database.execute(`PRAGMA foreign_keys = OFF`);
    await database.execute(`DELETE FROM users WHERE NOT tag="Nobody"`);
    let query = `INSERT INTO users (tag, name) VALUES `;
    let membersList = await brawl.getClubMembers();
    for (let member of membersList) {
      query += `('${member.tag}', '${member.name}'), `;
    }
    query = query.slice(0, -2);
    await database.execute(query, []);
    await database.execute(
      `UPDATE teams SET user1="Nobody", user2="Nobody", user3="Nobody" WHERE NOT name="No Team"`
    );
  },
  fetchteams: async () => {
    const teams = await database.query(`SELECT * FROM teams`, []);
    return teams;
  },
  fetchteam: async (teamname) => {
    const team = await database.query(
      `SELECT * FROM teams WHERE name='${teamname}'`
    );
    return team[0];
  },
  fetchmemberteam: async (member) => {
    const memberteamname = await database.query(
      `SELECT team FROM users WHERE tag=?`,
      [member]
    );
    const team = await database.query(
      `SELECT * FROM teams WHERE name='${memberteamname[0].team}'`
    );
    return team[0];
  },
  fetchteammembers: async (teamname) => {
    const members = await database.query(
      `SELECT user1, user2, user3 FROM teams WHERE name=?`,
      [teamname]
    );
    return members[0];
  },
  maketeam: async (teamName, roleid) => {
    await database.execute(
      `INSERT INTO teams (name, roleid) VALUES ("${teamName}", "${roleid}")`
    );
  },
  setteam: async (userTags, teamName) => {
    await database.execute(
      `UPDATE users SET team="${teamName}" WHERE tag="${userTags[0]}" OR tag="${userTags[1]}" OR tag="${userTags[2]}"`
    );
    if (teamName == "No Team") return;
    await database.execute(
      `UPDATE teams SET user1="${userTags[0]}", user2="${userTags[1]}", user3="${userTags[2]}" WHERE name="${teamName}"`
    );
  },
  resetteam: async (teamName) => {
    if (teamName == "No Team") return;
    await database.execute(
      `UPDATE teams SET user1="Nobody", user2="Nobody", user3="Nobody" WHERE name="${teamName}"`
    );
    await database.execute(
      `UPDATE users SET team="No Team" WHERE team="${teamName}"`
    );
  },
  delmember: async (member) => {
    await database.execute(`DELETE FROM users WHERE tag=?`, [member]);
  },
  addmember: async (member) => {
    await database.execute(`INSERT INTO users (tag, name) VALUES (?, ?)`, [
      member.tag,
      member.name,
    ]);
  },
  delteam: async (teamName) => {
    await database.execute(`DELETE FROM teams WHERE name="${teamName}"`);
    await database.execute(
      `UPDATE users SET team="No Team" WHERE team="${teamName}"`
    );
  },
  listteams: async () => {
    const teams = await database.query(
      `SELECT * FROM teams WHERE NOT name="No Team"`,
      []
    );
    return teams;
  },
  getState: async (name) => {
    const state = await database.query(
      `SELECT value FROM states WHERE name=?`,
      [name]
    );
    return state[0].value;
  },
  setState: async (name, value) => {
    await database.execute(
      `UPDATE states SET value="${value}" WHERE name="${name}"`
    );
  },
  fetchAllMembers: async () => {
    const members = await database.query(
      `SELECT * FROM users WHERE NOT tag="Nobody"`,
      []
    );
    return members;
  },
  fetchMemberByTag: async (member) => {
    const memberData = await database.query(`SELECT * FROM users WHERE tag=?`, [
      member,
    ]);
    return memberData[0];
  },
  fetchMemberByName: async (member) => {
    const memberData = await database.query(
      `SELECT * FROM users WHERE name=?`,
      [member]
    );
    return memberData[0];
  },
  bindMember: async (member, discordId) => {
    await database.execute(
      `UPDATE users SET discordId="${discordId}" WHERE tag="${member}"`
    );
  },
  unbindMember: async (member) => {
    await database.execute(
      `UPDATE users SET discordId=NULL WHERE tag="${member}"`
    );
  },
  editMember: async (member, name) => {
    await database.execute(
      `UPDATE users SET name="${name}" WHERE tag="${member}"`
    );
  },
};

module.exports = SQLHandler;

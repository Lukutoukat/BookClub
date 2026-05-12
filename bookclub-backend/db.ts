const { Pool } = require('pg')
const pool = new Pool({
  host: 'db',
  port: 5432,
  user: 'username',
  password: 'password',
  database: 'clubdb'
})
module.exports = pool
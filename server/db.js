const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'a22roblotlot_user',
    password: 'aWlakugefem9ZY6T',
    database: 'a22roblotlot_joc_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;

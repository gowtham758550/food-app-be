// var mysql = require('mysql')
// require('dotenv').config()

// const pool = mysql.createPool({
 
//  host : 'db-mysql-blr1-40413-do-user-9900615-0.b.db.ondigitalocean.com',
//    user: 'doadmin',
//     password : 'dcrrYttrd1zr4duH',
//     database: 'food_app',
//     port:'25060' ,
//     multipleStatements: true
//   })



// module.exports = pool;


var mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
 
 host : 'db-mysql-blr1-64209-do-user-9604151-0.b.db.ondigitalocean.com',
   user: 'doadmin',
    password : 'UHfzZKNCj2lh5c0f',
    database: 'food_app',
    port:'25060' ,
    multipleStatements: true
  })



module.exports = pool;
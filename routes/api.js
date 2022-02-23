var express = require('express');
var router = express.Router();
var pool =  require('./pool');

const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);



router.post('/validate',(req,res)=>{
    let body = req.body;
    console.log(req.body)
    pool.query(`select * from users where ${Object.keys(body)[0].toString()} = '${Object.values(body)[0]}'`,(err,result)=>{
      if(err) throw err;
      else if(result[0]) res.json({status : 500 , msg : 'User Found'});
      else res.json({status : 200 ,msg:'User Not Found'});
    })
})


router.post('/sign-up',(req,res)=>{
    let body = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    body['created_date']  = today;
    body['password'] = bcrypt.hashSync(req.body.password, salt); 

    pool.query(`insert into users set ?`,body,(err,result)=>{
        err ? res.json({status:500 , msg : 'error occured' , description : err}) : res.json({status:200 , msg : 'success' , description : result})
    })
})


router.post('/login',(req,res)=>{
    let body = req.body;
    pool.query(`select * from users where ${Object.keys(body)[0].toString()} = '${Object.values(body)[0]}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]) {
            let password = result[0].password;
            let checkpassword = bcrypt.compareSync(req.body.password, password);
            if(checkpassword == true) res.json({status : 200 ,msg:'User Found' , description : result})
            else res.json({status : 500 ,msg:'Incorrect Password' , description : 'Password Not Match'})
        }
        else res.json({status : 500 ,msg:'Email or Number Not Found' , description : 'Email or Number Not Exists'});
      })
})



module.exports = router;
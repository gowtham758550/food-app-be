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


router.get('/category',(req,res)=>{
    pool.query(`select * from category order by name`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})


router.get('/get-all-shops',(req,res)=>{
    var query = `SELECT *, SQRT(
        POW(69.1 * (latitude - '${req.query.latitude}'), 2) +
        POW(69.1 * (longitude - '${req.query.longitude}') * COS(latitude / 57.3), 2)) AS distance
    FROM vendor having distance <= 60000000000 ORDER BY distance;`
     pool.query(query,(err,result)=>{
    if(err) throw err;
        else res.json(result)
  })
  })


router.get('/single-vendor-details',(req,res)=>{
    var query = `select * from vendor where id = '${req.query.vendorid}';`
    pool.query(query,(err,result)=>{
      if(err) throw err;
      else res.json(result);
    })
  
  })  


  router.get('/get-address',(req,res)=>{
    pool.query(`select * from address where usernumber = '${req.query.usernumber}'`,(err,result)=>{
        if(err) throw err;
        else res.json(result)
    })
})



router.post('/save-address',(req,res)=>{
    let body = req.body;
    console.log('body h',req.body)
    pool.query(`insert into address set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
            msg : 'success'
        })
    })
})


router.get('/delete-address',(req,res)=>{
    pool.query(`delete from address where id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json({msg:'success'})
    })
  })
  
  
  
router.get('/get-single-address',(req,res)=>{
    pool.query(`select * from address where id = '${req.query.id}'`,(err,result)=>{
      if(err) throw err;
      else res.json(result)
    })
  })
  
  
  
  router.post('/update-address', (req, res) => {
    console.log('data',req.body)
    pool.query(`update address set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })
  
            
        }
    })
  })




  router.post("/cart-handler", (req, res) => {
    let body = req.body
    console.log(req.body)
    if (req.body.quantity == "0" || req.body.quantity == 0) {
    pool.query(`delete from cart where booking_id = '${req.body.booking_id}' and  usernumber = '${req.body.usernumber}'`,(err,result)=>{
        if (err) throw err;
        else {
          res.json({
            msg: "updated sucessfully",
          });
        }
    })
    }
    else {
        pool.query(`select oneprice from cart where booking_id = '${req.body.booking_id}' and  categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}' `,(err,result)=>{
            if (err) throw err;
            else if (result[0]) {
               // res.json(result[0])
                pool.query(`update cart set quantity = ${req.body.quantity} , price = ${result[0].oneprice}*${req.body.quantity}  where booking_id = '${req.body.booking_id}' and categoryid = '${req.body.categoryid}' and usernumber = '${req.body.usernumber}'`,(err,result)=>{
                    if (err) throw err;
                    else {
                        res.json({
                          msg: "updated sucessfully",
                        });
                      }

                })
            }
            else {
                body['oneprice'] = req.body.price
              body["price"] = (req.body.price)*(req.body.quantity)
          
                 pool.query(`insert into cart set ?`, body, (err, result) => {
                 if (err) throw err;
                 else {
                   res.json({
                     msg: "updated sucessfully",
                   });
                 }
               });

            }

        })
    }

})


router.post("/mycart", (req, res) => {
    console.log(req.body)
       var query = `select c.*,(select s.name from products s where s.id = c.booking_id) as servicename
       ,(select s.image from products s where s.id = c.booking_id) as productlogo,
       (select s.quantity from products s where s.id = c.booking_id) as productquantity
       from cart c where c.number = '${req.body.number}';`
       var query1 = `select count(id) as counter from cart where number = '${req.body.number}';`
       var query2 = `select sum(c.price) as total_ammount from cart c where c.quantity <= (select p.quantity from products p where p.id = c.booking_id ) and  c.number = '${req.body.number}' ;`
       var query3 = `select c.*,(select s.name from products s where s.id = c.booking_id) as servicename
       ,(select s.image from products s where s.id = c.booking_id) as productlogo,
       (select s.quantity from products s where s.id = c.booking_id) as productquantity,
       (select s.small_description from products s where s.id = c.booking_id) as productsmalldescription
   
         
       from cart c where c.quantity <= (select p.quantity from products p where p.id = c.booking_id ) and c.number = '${req.body.number}' ;`
       var query4 = `select count(id) as counter from cart c where c.quantity <= (select p.quantity from products p where p.id = c.booking_id ) and c.number = '${req.body.number}';`
       pool.query(query+query1+query2+query3+query4, (err, result) => {
         if (err) throw err;
         else if (result[0][0]) {
           req.body.mobilecounter = result[1][0].counter;
           console.log("MobileCounter", req.body.mobilecounter);
           res.json(result);
         } else
           res.json({
             msg: "empty cart",
           });
       });
   
   });



   router.post('/order-now',(req,res)=>{
    let body = req.body;
  console.log('body',req.body)
    let cartData = req.body
  
  
  //  console.log('CardData',cartData)
  
     body['status'] = 'pending'
      
  
    var today = new Date();
  var dd = today.getDate();
  
  var mm = today.getMonth()+1; 
  var yyyy = today.getFullYear();
  if(dd<10) 
  {
    dd='0'+dd;
  } 
  
  if(mm<10) 
  {
    mm='0'+mm;
  } 
  today = yyyy+'-'+mm+'-'+dd;
  
  
  body['date'] = today
  
  
  
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < 12; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
   orderid = result;
  
  
   
  
  
   pool.query(`select * from cart where number = '${req.body.usernumber}'`,(err,result)=>{
       if(err) throw err;
       else {
  
       let data = result
  
       for(i=0;i<result.length;i++){
        data[i].name = req.body.name
        data[i].date = today
        data[i].orderid = orderid
        data[i].status = 'pending'
        data[i].number = req.body.number
        data[i].usernumber = req.body.usernumber
        data[i].payment_mode = 'cash'
        data[i].address = req.body.address
        data[i].id = null
  
  
       }
  
  
  
  
  for(i=0;i<data.length;i++) {
   let j = i;
   pool.query(`insert into booking set ?`,data[i],(err,result)=>{
           if(err) throw err;
           else if(result){
  
  // console.log('afyeri',j);
  
  
  pool.query(`update products set quantity = quantity - ${data[j].quantity} where id = '${data[j].booking_id}'`,(err,result)=>{
   if(err) throw err;
   else {
  console.log(data[j].quantity);
   }
  
  })
  
           }
      })
  }
  
  
    
  
  
  pool.query(`delete from cart where number = '${req.body.usernumber}'`,(err,result)=>{
    if(err) throw err;
    else {
  
      res.json({
        msg : 'success'
    })
  
    }
  })
  
  
       }
   })
  
   
  })



  
  

module.exports = router;
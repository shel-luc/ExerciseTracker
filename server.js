const express = require('express');
const url     = require('url');
const ejs     = require('ejs');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
var urldb   ="mongodb+srv://loukdev:cheloulou04@cluster0-n0gfx.mongodb.net/tracker?retryWrites=true&w=majority";

const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'));

app.set('view engine', 'ejs');
// api index route
app.get('/',(req,res)=>{
  res.render('index')
});


// Users api routes

// Route to show all registered users
app.get('/api/exercise/users',(req,res)=>{
  mongodb.MongoClient.connect(urldb, (err, database) =>{
  if(err) throw err;
  var mydb1 = database.db('tracker');
  var cln1 = mydb1.collection('user');
  cln1.find({}).toArray((err,docs)=>{
      if(err)  {

        console.log('error');
      }else{
      res.render('resultusers',{docs});
      }
      database.close();
  });

});
});

// Route to register new user
app.post('/api/exercise/new_user',(req,res)=>{

    mongodb.MongoClient.connect(urldb, (err, database)=>{
    if(err) throw err;
      var mydb = database.db('tracker');
      var cln = mydb.collection('user');
      cln.insert({username:req.body.username},(err,docs)=>{
          if(err)
            { console.log('Error ') }
            else{
              res.render('results',{'_id':docs.ops[0]._id,username:docs.ops[0].username});
              database.close();
        }
      });
   });

});


// Exercises api routes

// Show all exercises registered for all users
app.get('/api/exercise/showall',(req,res)=>{

    mongodb.MongoClient.connect(urldb, (err, database) =>{
    if(err) throw err;
    var mydb1 = database.db('tracker');
    var cln1 = mydb1.collection('exercises');
    cln1.find({}).toArray((err,docs)=>{
        if(err)  {
          console.log('error');
        }else{
          res.send(docs);
        }
        database.close();
    });

});
});

// Show logs of exerices registered for a specified user using required parameter userid, and optional parameters form, to and limit
app.get('/api/exercise/log',(req,res)=>{
    let { id, from, to, limit } = req.query;
    let queryObject = {};
    if(!limit){
      limit = 0;
    }else{
      limit = parseInt(limit)
    }
    if(id && !from && !to){
      queryObject = {"userid": id};
    }

    if(id && from && !to ){
      queryObject = {"userid": id, date: from};
    }

    if(id && !from && to){
      queryObject = {"userid": id,date:to};
    }

    if(id && from && to){
      queryObject = {"userid":id,"$or":[{"date":from}, {"date":to}]};
      limitVar = limit;
    }

    mongodb.MongoClient.connect(urldb, (err, database)=>{
    if(err) throw err;
    const mydb1 = database.db('tracker');
    const cln1 = mydb1.collection('exercises');
    cln1.find(queryObject).limit(limit).toArray((err,docs)=>{
        if(err)  {
          console.log('error');
        }else{
          res.send(docs);
        }
        database.close();
    });
});

});

// Route to register and post exercise
app.post('/api/exercise/add',(req,res)=>{

  mongodb.MongoClient.connect(urldb, (err, database)=>{
  if(err) throw err;
    var mydb = database.db('tracker');
    var cln = mydb.collection('exercises');
    let { userid,description,duration,date } = req.body;
    if (!date){
       let currentDate = new Date();
       date = currentDate.getFullYear()+'-'+currentDate.getMonth()+1+'-'+currentDate.getDate();
      }
    cln.insert({userid,description,duration,date},(err,docs)=>{
        if(err)
          { console.log('Error ') }
          else{
            res.send({'_id':docs.ops[0]._id,username:docs.ops[0].username,description:docs.ops[0].description,duration:docs.ops[0].duration,date:docs.ops[0].date});
           database.close();
      }
    });
 });
});

// Route to handle un-available routes
app.get('*', (req,res)=>{
  res.send({'error':'route '+ req.path +' not found'});
});

const listener = app.listen(3000, function () {
  console.log('Your app is working');
});

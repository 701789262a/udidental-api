const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var mysql      = require('mysql');
let converter = require('json-2-csv');
const { delimiter } = require('prompt');

const app = express();
const port = 60001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
psw = process.argv[2];
var connection = mysql.createConnection({
    host     : '192.168.0.112',
    user     : 'paulo',
    password : psw,
    database : 'dm',
    insecureAuth: true
  });
try{
  connection.connect();

}catch(e){
  throw e;
}

function formatDate(date = new Date()) {
    const year = date.toLocaleString('default', {year: '2-digit'});
    const month = date.toLocaleString('default', {
      month: '2-digit',
    });
    const day = date.toLocaleString('default', {day: '2-digit'});
  
    return [year, month, day].join('');
  }
  
app.get('/create', (req, res) => {
    var headers = req.headers;

    console.log(headers);
    try{
    connection.query('SELECT * FROM `dms` WHERE `udipi` = ?',[headers.udipi], function (error, results, fields) {
        if (error) throw error;
        if (results.length == 0){
            console.log('eccoci create');
            var query = connection.query('INSERT INTO `dms` (udidi,udipi,lot,serial,prod,scad,curr_date,type) VALUES (?,?,?,?,?,?,?,?)', [headers.udidi,headers.udipi,headers.lot,headers.serial,headers.prod,headers.scad,formatDate(new Date()),headers.type], function (error, results, fields) {
                if (error) throw error;
                console.log(3);
                res.status(200).send("3");
              });
        }else{
          console.log(4);
          res.status(200).send("4");
        }
      });
    }catch(e){
      console.log(1);
      res.status(200).send("1");
    }
      

});
app.get('/assign', (req, res) => {
    var headers = req.headers;
    console.log(headers);
    try{
    connection.query('SELECT * FROM `dms` WHERE `udipi` = ? and patient is NULL',[headers.udipi], function (error, results, fields) {
        if (error) throw error;
        if (results.length != 0){
            // upload
            console.log(`eccoci assign ${headers.udipi}`);
            var query = connection.query('UPDATE `dms`  SET patient = ?, anatomic_pos = ?, chirurgy_date = ?, note = ? WHERE udipi = ?;', [headers.patient,headers.anatomic_pos, headers.chirurgy_date, headers.note, headers.udipi], function (error, results, fields) {
                if (error) throw error;
                console.log(3);
                res.status(200).send("3");
            });
        }else{
          res.status(200).send("1");
        }
      });}catch(e){
        console.log(1);
        res.status(200).send("1");
      }
});

app.get('/getinventory', (req, res) => {
  var headers = req.headers;
  console.log(headers);
  if (headers.assigned == 'true'){
    operator = '!= ""';
  }else{
    operator ='is null';
  }
  console.log(`SELECT * FROM dms WHERE patient ${operator} ""`);
  try{
  connection.query(`SELECT * FROM dms WHERE patient ${operator}`,[operator], function (error, results, fields) {
      if (error) throw error;
      console.log(results)
      res.status(200).send(`${results.length}`)
      
    });}catch(e){
      console.log(0);
      res.status(200).send("0");
    }
});

app.get('/getdata', (req, res) => {
    var headers = req.headers;

    console.log(headers);
    connection.query('SELECT * FROM `dms`', function (error, results, fields) {
        if (error) throw error;
        const csv = converter.json2csv(results,{'delimiter':{'field':';'}});

        console.log(csv)
        res.status(200).send(csv);
    });

});
app.listen(port, () => console.log(`Hello world app listening ony port ${port}!`))
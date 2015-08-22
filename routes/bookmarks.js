var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('cozy.db');

var mysql = require("mysql");
var pool = mysql.createPool({
    connectionLimit   :   100,
    host              :   'localhost',
    user              :   'root',
    password          :   'root',
    database          :   'poolapp',
    debug             :   false
});

// We render the templates with the data
router.get('/', function(req, res, next) {
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          // if (err) throw err;
          return;
        }
        /*connection.query("INSERT INTO `status` (`s_text`) VALUES ('"+status+"')",function(err,rows){
          connection.release();
          if(!err) {
            callback(true);
          }
        });*/
        var datetime = '2015-08-22 15:09:18';
        connection.query("SELECT * FROM geodata WHERE created_on >= '"+datetime+"'", function(err, rows, fields) {
          // if (err) throw err;
          if(!err){
              // console.log('The data: ', rows);
              res.render('bookmarks/index', {title: 'My Bookmarks',bookmarks: rows}, function(err, html) {
                res.send(200, html);
              });
          }else{
            // console.log(err);
            res.render('bookmarks/index', {title: 'My Bookmarks',bookmarks: rows}, function(err, html) {
                res.send(200, html);
            });
          }
        });
        connection.on('error', function(err) {
          // if (err) throw err;
          return;
        });
    });
});

// We define a new route that will handle bookmark creation
router.post('/add', function(req, res, next) {
  /*title = req.body.title;
  url = req.body.url;
  sqlRequest = "INSERT INTO 'bookmarks' (title, url) " +
               "VALUES('" + title + "', '" + url + "')"
  db.run(sqlRequest, function(err) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('/bookmarks');
    }
  });*/
  res.redirect('/bookmarks');
});

// We define another route that will handle bookmark deletion
router.get('/delete/:id', function(req, res, next) {
  /*db.run("DELETE FROM bookmarks WHERE id='" + req.params.id + "'",
         function(err) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('/bookmarks');
    }
  });*/
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          // if (err) throw err;
          return;
        }
        /*connection.query("INSERT INTO `status` (`s_text`) VALUES ('"+status+"')",function(err,rows){
          connection.release();
          if(!err) {
            callback(true);
          }
        });*/
        var datetime = '2015-08-22 15:09:18';
        connection.query("DELETE FROM geodata WHERE id='" + req.params.id + "'", function(err, rows, fields) {
          // if (err) throw err;
            if(!err){
                res.redirect('/bookmarks');
            }else{
                res.redirect('/bookmarks');
            }
        });
        connection.on('error', function(err) {
            res.redirect('/bookmarks');
            return;
        });
    });
});

// We define another route that will handle bookmark updation
router.post('/edit/:id', function(req, res, next) {
  /*title = req.body.title;
  url = req.body.url;
  db.run("UPDATE bookmarks SET title='"+title+"',url='"+url+"' WHERE id='" + req.params.id + "'",
         function(err) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('/bookmarks');
    }
  });*/
    res.redirect('/bookmarks');
});

/* GET add page. */
router.get('/add', function(req, res, next) {
  res.render('bookmarks/add', { title: 'Add Bookmark' });
});

/* GET edit page. */
router.get('/edit/:id', function(req, res, next) {
  /*sqlRequest = "SELECT * FROM bookmarks where id='"+req.params.id+"'";
  db.get(sqlRequest, function(err,row) {
    if(err !== null) {
      next(err);
    }
    else {
      res.render('bookmarks/edit', { title: 'Update Bookmark',bookmark:row });
    }
  });  */
    res.redirect('/bookmarks');
});

module.exports = router;
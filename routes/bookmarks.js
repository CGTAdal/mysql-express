var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('cozy.db');

// We render the templates with the data
router.get('/', function(req, res, next) {

  db.all('SELECT * FROM bookmarks ORDER BY id', function(err, row) {
    if(err !== null) {
      // Express handles errors via its next function.
      // It will call the next operation layer (middleware),
      // which is by default one that handles errors.
      next(err);
    }
    else {
      console.log(row);
      res.render('bookmarks/index', {title: 'My Bookmarks',bookmarks: row}, function(err, html) {
        res.send(200, html);
      });
    }
  });
});

// We define a new route that will handle bookmark creation
router.post('/add', function(req, res, next) {
  title = req.body.title;
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
  });
});

// We define another route that will handle bookmark deletion
router.get('/delete/:id', function(req, res, next) {
  db.run("DELETE FROM bookmarks WHERE id='" + req.params.id + "'",
         function(err) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('/bookmarks');
    }
  });
});

// We define another route that will handle bookmark updation
router.post('/edit/:id', function(req, res, next) {
  title = req.body.title;
  url = req.body.url;
  db.run("UPDATE bookmarks SET title='"+title+"',url='"+url+"' WHERE id='" + req.params.id + "'",
         function(err) {
    if(err !== null) {
      next(err);
    }
    else {
      res.redirect('/bookmarks');
    }
  });
});

/* GET add page. */
router.get('/add', function(req, res, next) {
  res.render('bookmarks/add', { title: 'Add Bookmark' });
});

/* GET edit page. */
router.get('/edit/:id', function(req, res, next) {
  sqlRequest = "SELECT * FROM bookmarks where id='"+req.params.id+"'";
  db.get(sqlRequest, function(err,row) {
    if(err !== null) {
      next(err);
    }
    else {
      res.render('bookmarks/edit', { title: 'Update Bookmark',bookmark:row });
    }
  });  
});

module.exports = router;
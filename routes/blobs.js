var express=require('express'),
    router=express.Router(),
    mongoose=require('mongoose'),
    bodyParse=require('body-parser'),
    methodOverride=require('method-override');

router.use(bodyParse.urlencoded({extended:true}));

router.use(methodOverride(function(req,res){
    if(req.body && typeof req.body==='object'&&'_method' in req.body)
    var method=req.body._method
    delete req.body._method
    return method
}))

router.route('/')
    .get(function(req,res,next){
        mongoose.model('Blob').find({},function(err,blobs){
            if(err){
                return console.error(err);
            }else{
                res.format({
                    html:function(){
                        res.render('blobs/index',{
                            title:'All my Blobs',
                            "blobs":blobs
                        });
                    },
                    json:function(){
                        res.json(infophotos);
                    }
                });
            }
        });
    })
    .post(function(req,res){
        var name=req.body.name;
        var badge=req.body.badge;
        var dob=req.body.dob;
        var company=req.body.company;
        var isloved=req.body.isloved;
        mongoose.model('Blob').create({
            name:name,
            badge:badge,
            dob:dob,
            isloved:isloved
        },function(err,blob){
            if(err){
                res.send("There was a problem adding the infomation to the database.")
            }else{
                console.log('POST creating new blob:'+blob);
                res.format({
                    html:function(){
                        res.location("blobs");
                        res.redirect("/blobs");
                    },
                    json:function(){
                        res.json(blob);
                    }
                })
            }
        })
    });

router.get("/new",function(req,res){
    res.render('blobs/new',{title:"Add New Blob"});
})

router.param('id',function(req,res,next,id){
    mongoose.model('Blob').findById(id,function(err,blob){
        if(err){
            console.log(id+' was not found');
            res.status(404);
            var err=new Error('Not Found');
            err.status=404;
            res.format({
                html:function(){
                    next(err);
                },
                json:function(){
                    res.json({message:err.status+' '+err});
                }
            });
        }else{
            req.id=id;
            next();
        }
    });
});

router.route('/:id')
    .get(function(req,res){
        mongoose.model('Blob').findById(req.id,function(err,blob){
            if(err){
                console.log('GET Error: There was a problem retrieving:'+err);
            }else{
                console.log('GET Retrieving ID:'+blob._id);
                var blobdob=blob.dob.toISOString();
                blobdob=blobdob.substring(0,blobdob.indexOf('T'))
                res.format({
                    html:function(){
                        res.render('blobs/show',{
                            "blobdob":blobdob,
                            "blob":blob
                        });
                    },
                    json:function(){
                        res.json(blob);
                    }
                });
            }
        });
    });

router.get('/:id/edit', function(req, res) {
    //search for the blob within Mongo
    mongoose.model('Blob').findById(req.id, function (err, blob) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the blob
            console.log('GET Retrieving ID: ' + blob._id);
            //format the date properly for the value to show correctly in our edit form
          var blobdob = blob.dob.toISOString();
          blobdob = blobdob.substring(0, blobdob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('blobs/edit', {
                          title: 'Blob' + blob._id,
                        "blobdob" : blobdob,
                          "blob" : blob
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(blob);
                 }
            });
        }
    });
});

router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var badge = req.body.badge;
    var dob = req.body.dob;
    var company = req.body.company;
    var isloved = req.body.isloved;

   //find the document by ID
        mongoose.model('Blob').findById(req.id, function (err, blob) {
            //update it
            blob.update({
                name : name,
                badge : badge,
                dob : dob,
                isloved : isloved
            }, function (err, blobID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/blobs/" + blob._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(blob);
                         }
                      });
               }
            })
        });
});

router.delete('/:id/edit', function (req, res){
    //find blob by ID
    mongoose.model('Blob').findById(req.id, function (err, blob) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            blob.remove(function (err, blob) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + blob._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/blobs");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : blob
                               });
                         }
                      });
                }
            });
        }
    });
});

module.exports = router;
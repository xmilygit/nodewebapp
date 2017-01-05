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
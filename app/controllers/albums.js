'use strict';

var fs = require('fs');
var mongoose = require('mongoose');
var Promise = require('bluebird');
mongoose.Promise = Promise;
var Albums = require('../models/album');
var Photos = require('../models/photo');
var upload = require('../utils/upload');
var errorHandler = require('../errors/errorHandler');
var config = require('../../config/config');

exports.create = function(req, res) {
    Albums.create({
        name : req.body.name,
        description : req.body.description,
        albumType: req.body.albumType,
        path : config.path_albums + req.body.name + "/"
    })
    .then(function(album){
        fs.mkdirSync(config.path_media + config.path_albums + req.body.name);
        return res.status(201).send(album);
    })
    .catch(function(error) {
        console.log(error);
        res.status(400).send({ message: error.code == 11000 ? "Ya hay un álbum con igual nombre, descripción, foto de portada o foto 'header' de 'album" :'Error occurred while creating the album.' });
    });
};

exports.all = function(req, res) {
    Albums.find().populate("photos").populate("albumImage")
    .then(function(albums) {
        return res.json(albums);
    })
    .catch(function(error) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(error) });
    });
};

exports.getById = function(req, res) {
    Albums.findOne({ name : req.params.name }).populate("photos")
    .then(function(album) {
        if (!album) return res.status(404).send({ message: "Album not found." })
        return res.json(album);
    })
    .catch(function(error) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(error) });
    });
};

exports.update = function(req, res) {
    Albums.findOne({ name : req.params.name})
    .then(function(album){
        if (!album) return res.status(404).send({ message: "Album not found." })
        return album.update({$set:{name: req.body.name,description: req.body.description,albumImage: req.body.albumImage, albumImageHeaderPath: req.body.albumImageHeaderPath}})
    })
    .then(function (album) {
        return res.status(204).end();
    })
    .catch(function(error) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(error)});
    });
};

exports.delete = function(req, res) {
    Albums.findOne({ name : req.params.name })
    .then(function(album){
        if (!album) return res.status(404).send({ message: "Album not found." })
        album.remove();
        return album;
    })
    .then(function(album){
        rmdir(config.path_media + album.path);
        return res.status(204).end();
    })
    .catch(function(error) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(error) });
    });
};

exports.deletePhoto = function(req,res){
    var albumPath =  Albums.findOne({ name : req.params.name }).path
    Photos.findOne({_id : req.params.photo_id})
    .then(function(photo){
       photo.remove();
       return photo; 
    })
    .then(function(photo){
        fs.unlink(config.path_media + photo.path);
        return res.status(204).end();
    })
    .catch(function(error) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(error) });
    });
};

exports.addPhotos = function(req, res) {
    var upload_p = upload.any();

    upload_p(req, res, function(uploadError) {
        if(uploadError){
            return res.status(400).send({
                message: 'Error occurred while uploading the photos'
            });
        }
        var album = JSON.parse(req.body.album);
        Promise.each(req.files, function(file) {
             return Photos.create({
                name: file.originalname,
                path: album.path + file.originalname
            }).then(function(photo){
                return Albums.update(
                    { name: req.params.name },
                    { $addToSet: { photos: photo } 
                })
            }).catch(function(error){
                return res.status(404).send({
                                message: error.code == 11000 ? "La imágen ya fue subida en este álbum." : errorHandler.getErrorMessage(error)
                            });
            })
            
        })
        .then(function(allItems) {
            return Albums.findOne({name : req.params.name}).populate('photos').populate('albumImage');
        })
        .then(function(album) {
            return res.status(200).send(album);
        });
    });
    
};

var rmdir = function(dir) {
    var list = fs.readdirSync(dir);
    for(var i = 0; i < list.length; i++) {
        var filename = dir + list[i];
        console.log(filename);
        var stat = fs.statSync(filename);

        if(filename == "." || filename == "..") {
            // pass these files
        } else if(stat.isDirectory()) {
            // rmdir recursively
            rmdir(filename);
        } else {
            // rm fiilename
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dir);
};


/*
  MIT License

  Copyright (c) [2018] [Amjad Nashashibi]

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

'use strict';

var User = require('../models/user');
const _ = require('lodash');

module.exports ={
    index: (req,res) => {
        User.find({"email":{$ne:null}}, (err,users) =>{
            if(err){
                res.status(500).json(err).end();
                return;
            }

            res.status(200).json({
                users : users
            }).end();
        }).catch((e) => {
            console.log(e);
            res.status(400).send({"message": e.toString()});
        });
    },

    create: (req,res) => {
        var user = new User(req.swagger.params.user.value.user);
        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            res.header('auth', token).status(200).json({
                user: _.pick(user, ['_id', 'email'])
            }).end();
        }).catch((e) => {
            console.log(e);
            res.status(400).send({"message": e.toString()});
        });
    },

    get: (req,res) => {
        const docId = req.swagger.params[`userId`].value;
        User.findById(docId).then((user) => {
            res.status(200).json({user: user}).end();
        }).catch((e) => {
            res.status(400).send({"message": "Not Found! " + e.description});
        });
    },

    delete: (req,res) => {
        const docId = req.swagger.params[`userId`].value;
        User.findOneByIdAndDelete(docId).then((user) => {
            res.status(200).send({"message": "email: " + user.email + " ,DocId:" + docId + " Deleted!"});
        }).catch((e) => {
            res.status(400).send({"message": "Something Went Wrong! "});
        });
    },

    login: (req,res) => {
        let params = new User(req.swagger.params.login.value);
        User.findByCredentials(params.email, params.password).then((user) => {
            return user.generateAuthToken().then((token) => {
                res.header('auth', token).send(user);
            });
        }).catch((e) => {
            res.status(400).send({"message": "Login Failed!"});
        });

    }
};
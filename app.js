const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const formidable = require('express-formidable')
app.use(formidable())
const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID
const http = require('http').createServer(app)
const bcrypt = require('bcrypt')
const fileSystem = require('fs')
const jwt = require('jsonwebtoken')
const { RSA_NO_PADDING } = require('constants')
const accessToken = "MyaccessTokenchestBrah"
const accessTokenSecret = "MyaccessTokenSecret"

app.use("/",express.static(path.join(__dirname, "/public")))
app.set('view engine', 'ejs')

const socketIO = require('socket.io')(http)
const SocketID = ""
const users = []

const mainURL = "http://localhost:3000"

socketIO.on('connection', (socket)=>{console.log('User connected', socket.id)
SocketID = socket.id

})

app.listen(port, (error)=>{
    if(error){console.log(error)}
    else{
        console.log('Server conectado na porta', port)
    }


mongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true, useNewUrlParser:true }, function(error,  client){

let database = client.db('MySocialNetwork')
console.log('Database Conectada')

app.get('/signup', (req,res)=>{res.render('signup')

})

app.post("/signup", (req,res)=>{
    let name = req.fields.name
    let username = req.fields.username
    let email = req.fields.email
    let password = req.fields.password
    let gender = req.fields.gender

    database.collection('users').findOne({
        $or:[{
            "email":email
             },
             {
            "username":username
            }]}, function(error, user){
                if(user == null){
                    bcrypt.hash(password, 10, function(error, hash){
                        database.collection('users').insertOne({
                            "name":name,
                            "username":username,
                            "email":email,
                            "password":hash,
                            "gender":gender,
                            "profileImage":"",
                            "coverPhoto":"",
                            "dob":"",
                            "city":"",
                            "country":"",
                            "aboutMe":"",
                            "friends":[],
                            "pages":[],
                            "notifications":[],
                            "groups":[],
                            "posts":[],


                        }, function(error, data){
                            res.json({"status":"success",
                        "message":"Usuário criado, você pode fazer o login agora"
                    })
                        })
                    })
                 } else{res.json({
                        "status":"error",
                        "message":"E-mail ou usuário já existem"
                    })
                }
            })
    })

    app.get('/login', (req,res)=>{res.render('login')
})

app.post('/login', (req,res)=>{

    let email = req.fields.email
    let password = req.fields.password

    database.collection('users').findOne({
        "email":email}, function(error, user){
            if(user == null){
                res.json({"status":"error",
                          "message":"E-mail não existe"
                        });
                    }else{
                        bcrypt.compare(password, user.password, function(error, isVerify){
                            if(isVerify){
                                let accessToken = jwt.sign({email:email}, accessTokenSecret)
                                database.collection('users').findOneAndUpdate({
                                    "email":email},
                                    {$set:{
                                        "accessToken":accessToken
                                    }
                                },function(error,data){
                                        res.json({
                                            "status":"success",
                                            "message":"Login efetuado, usuário confirmado",
                                            "accessToken":accessToken,
                                            "profileImage": user.profileImage
                                        });
                                    });
                                }else{
                                    res.json({
                                        "status":"error",
                                        "message":"E-mail ou password incorreto."
                                    })
                                }
                                })
                            }
                        })
                    })
                app.get('/updateProfile', (req,res)=>{res.render('updateProfile')
            })

            app.post('/getUser', (req,res)=>{

                let  accessToken = req.fields.accessToken
                database.collection('users').findOne({
                    'accessToken':accessToken},function(error, user){
                        if(user == null){
                            res.json({
                                "status":"error",
                                "message": "Usuário pode ter logado. Por favor tente novamente"
                            })
                        }else{
                        res.json({
                            "status":"success",
                            "message":"Record has been fetched",
                            "data":user
                        })
                        }
                    })
                })
                app.get('/logout', (req,res)=>{
                    res.redirect('/login')
                });
            });

            });
        

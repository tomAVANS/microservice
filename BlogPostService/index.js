const express = require('express');
const app = express();
require('./config/db.js')();
let mongoose = require('mongoose');
require('./models/post')
const cors = require("cors");  //ga eens na waarom deze module wordt gebruikt
const port = process.env.PORT || 3015;
const publisher = require('./publisher.js')
require('./consumer.js') //For starting consumer

app.use(cors());
app.use(express.json());

let Post = mongoose.model('Post');


app.post('/posts/:id',async(req,res)=> {
    try{

        let post = new Post(req.body);
        post._id = req.params.id;

        post.save().then(async(savedPost) => {
            res.status(201);
            res.json(savedPost);

            await publisher.publish(savedPost._id);
        }).catch(err => {
            res.status(500);
            res.json(err)
            console.log(err);
        });
        //opslaan in db en wanneer dit lukt kun je doorgaan met bijv. het 
        //geven van een respons bijv. 202 Accepted en de message op de event broker plaatsen.
        //in het andere geval: raise an exception!
        //in both cases return a response
    }catch(err){
        // melding teruggeven
        res.status(500);
        res.json(err)
    }

})

app.get('/posts/:id',async(req,res)=> {
    try{

    }catch(err){
        // melding teruggeven
        res.status(500);
        res.json(err)
    }

})

app.get('/posts/',async(req,res)=> {
    try{
        Post.find({}).then(data => {
            res.status(200);
            return res.json(data);
        })
    }catch(err){
        // melding teruggeven
        res.status(500);
        res.json(err)
    }

})

app.delete('/posts/:id',async(req,res)=> {
    try{
        
        await Post.findByIdAndDelete(req.params.id);
        Post.comments
        publisher.publishDeletion(req.params.id); 
        //opslaan in db en wanneer dit lukt kun je doorgaan met bijv. het 
        //geven van een respons bijv. 202 Accepted en de message op de event broker plaatsen.
        //in het andere geval: raise an exception!
        //in both cases return a response
        res.send("value");
        await pub("value");

    }catch(err){
        // melding teruggeven
    }

})

app.get('/post/:id',async(req, res,next) => {

    let post = await Post.findById(req.params.id);

    if (post == null) {
        res.status(404);
        res.json();
        return;
    }

    let comments = await publisher.requestComments(post.id);
    post["comments"] = JSON.parse(comments);
    res.status(200);
    res.json(post);
})

// async function consume2(){
       
//         const connection = await rabbitConnection;
//         if(channel === undefined){
//            channel = await connection.createChannel();
//         }
//         const qok = await channel.assertQueue("reply",{ exclusive: false});
//         const bindQueue = await channel.bindQueue("reply","PubSubDemo","message.for.post_and_reply");
//         await channel.consume("reply", message =>{
//             console.log("Wacht op messages...");
//             console.log(`Consumed message in Postblog service in the index.js : ${message.content.toString()}`);
//             msg = message.content.toString();
//             channel.ackAll();
//         });

//     }


// consume2();

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})
const express = require('express');
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3014;
const pub = require('./publisher.js')
require('./config/db.js')();
let mongoose = require('mongoose');
require('./models/comment');
require('./models/post');
const { async } = require('q');
require('./consumer.js')

let Comment = mongoose.model('Comment');
let Post = mongoose.model('Post');

app.use(cors());
app.use(express.json());

app.post('/comment', async(req, res) => {
    
    let post = await Post.findById(req.body.blogPostId);
    if (post == null) {
        res.status(404);
        res.json();
        return;
    }

    let comment = new Comment(req.body);
    await comment.save();
    post.comments.push(comment.id);
    await post.save();

    res.status(201);
    res.json(comment);
})

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})
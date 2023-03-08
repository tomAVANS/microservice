require('./models/post')
require('./models/comment')
let mongoose = require('mongoose');
let Post = mongoose.model('Post');
let Comment = mongoose.model('Comment')
const rabbitConnection = require('../sharedRabbitMqResource.js')
let channel;

const consume = async ()=>{
    try { 
        rabbitConnection.then(conn => {
            conn.createChannel().then(chan => {
                let exchange = 'topic_blog';
                chan.assertExchange(exchange, 'topic', {
                    durable: true
                });
                
                let keys = ["post.create"]
                chan.assertQueue('post', {
                    exclusive: false
                }).then(queue => {
                    keys.forEach(function(key) {
                        chan.bindQueue(queue.queue, exchange, key);
                    });

                    chan.consume(queue.queue, function(msg) {
                        if (msg.fields.routingKey == "post.create") {
                            storePost(msg.content.toString());
                        }
                        else if (msg.fields.routingKey == "post.delete") {
                            deletePost(msg.content.toString());
                        }
                    }, {
                        noAck: true
                    });
                });

                chan.assertQueue("rpc_request_comment_queue", {
                    exclusive: false,
                    durable: false
                }).then(queue => {
                    channel.consume(queue.queue, async function (msg) {
                        let comments = await getCommentsForBlogPost(msg.content);
                        channel.sendToQueue(msg.properties.replyTo, Buffer.from(comments), {
                            correlationId: msg.properties.correlationId
                        }, {
                            noAck: true
                        })
                        channel.ack(msg);
                    });
                });

                channel = chan;
            })
        });
    
    } catch (error) {
        console.log (`error is: ${error}`);
    }
}

function storePost(postId) {
    let post = new Post({_id: postId});
    post.save();
}

async function deletePost(postId) {
    console.log("delete");
    let post = await Post.findById(postId).populate('comments');
    let idsToDelete = post.comments.map(c => c._id);
    idsToDelete.forEach(async id => {
        await Comment.findByIdAndDelete(id);
    })
    
    await Post.findByIdAndDelete(postId);
}


module.exports.consume=consume();

async function getCommentsForBlogPost(blogPostId) {
    let post = await Post.findById(blogPostId).populate('comments');
    return JSON.stringify(post.comments);
}
const { async, Promise } = require('q');
const rabbitConnection = require('../sharedRabbitMqResource.js')

let channel;
let exchange;
let connection;
startup();
async function startup(){ 
    try {
        rabbitConnection.then(conn =>{
            connection = conn;
            conn.createChannel().then(chan => {
                exchange = 'topic_blog';
                chan.assertExchange(exchange, 'topic', {
                    durable: true
                });
        
                let keys = ["post.create", "post.delete"]
                chan.assertQueue('post', {
                    exclusive: false
                }).then(queue => {
                    keys.forEach(function(key) {
                        chan.bindQueue(queue.queue, exchange, key);
                    });
                });
        
                channel = chan;
            });
        })
    }catch (error) {
        console.log ('err in publisher : ' +error);
    }
}
const publish = async function publish(msg){ 
    try { 
        channel.publish("topic_blog", 'post.create', Buffer.from(msg))
    }catch (error) {
        console.log ('err in publisher : ' +error);
    }
}

exports.publish=publish;
exports.requestComments = async function(blogPostId) {

    let chan = await connection.createChannel();

    let queue = await chan.assertQueue("rpc_reply_comment_queue", {
        exclusive: false,
        durable: false
    });

    let correlationId = generateUuid();
    chan.bindQueue(queue.queue, exchange, 'post.get');
    chan.sendToQueue("rpc_request_comment_queue", Buffer.from(blogPostId), {
        correlationId: correlationId,
        replyTo: queue.queue
    });

    let comments;
    await new Promise((resolve, reject) => {
        chan.consume(queue.queue, msg => {
            if (msg.properties.correlationId == correlationId) {
                comments = msg.content.toString();
                chan.ack(msg);
                chan.close();
                resolve(comments);
            }
        }, );
    })

    JSON.parse(comments);
    return comments;
}

exports.publishDeletion = function(blogPostId) {
    channel.publish("topic_blog", 'post.delete', Buffer.from(blogPostId));
}

function generateUuid() {
    return Math.random().toString() +
           Math.random().toString() +
           Math.random().toString();
  }
const amqp = require('amqplib');
const uri = 'amqp://localhost:5672';

module.exports = amqp.connect(uri);
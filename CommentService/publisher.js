const rabbitConnection = require('../sharedRabbitMqResource.js')
let channel;
startup();
async function startup(){ 
    try {
        const connection = await rabbitConnection;
        if(channel === undefined){
            // channel = await connection.createChannel();
        }
        await channel.assertExchange("Blog","fanout",{duable:false}); 
    }catch (error) {
        console.log ('err in publisher : ' +error);
    }
}
const publish = async function publish(msg){ 
    try { 
          //await channel.publish("Blog","",Buffer.from("hierin komt je payload"));  
    }catch (error) {
        console.log ('err in publisher : ' +error);
    }
}

module.exports=publish;
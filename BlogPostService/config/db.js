var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

module.exports = function(){
    if (mongoose.connection.readyState == 0) {
        var uri = 'mongodb://127.0.0.1:27017/blogPosts';
        var options = {
            db: {native_parser: true},
            server: {poolSize: 5},
            replset: {rs_name: 'myReplicaSetName'},
            user: 'myUserName',
            pass: 'myPassword'
        }
        mongoose.connect(uri);
    }
}
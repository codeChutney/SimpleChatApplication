var express = require('express'),
	path = require('path'),
	http = require('http');

var app = express();

//express settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
//use() is used for middleware and express.static is the only built-in middleware for express
app.use(express.static(path.join(__dirname, 'public') ));

if('development' === app.get('env')) {
	//add debug middleware here
}

var theServer = require('http').createServer(app);
var io = require('socket.io')(theServer);

theServer.listen(app.get('port'), function(){
	console.log('Express is listening at '+ app.get('port'));
});

app.get('/chat', function(req, res){
	res.render('index', {
		title: 'Whazappppp'
	});
})

var totalLoggedInUsers = 0;

io.on('connection', function(socket){
	var userAdded = false;
	
	socket.emit('init', totalLoggedInUsers);
	
	socket.on('new message_c', function(clientSentData)
	{
		socket.broadcast.emit('new message_s', {
			username: socket.username,
			message: clientSentData.message,
			totalUsers: totalLoggedInUsers
		});
	});
	
	socket.on('new user_c', function(userDetails)
	{
		socket.username = userDetails;
		userAdded = true;
		++totalLoggedInUsers;
		socket.broadcast.emit('user joined_s', {
			onlineUsers: totalLoggedInUsers,
			userName: userDetails
		});
		socket.emit('user joined_s', {
			onlineUsers: totalLoggedInUsers,
			userName: userDetails
		});
	});

	 socket.on('disconnect', function () {
		if(userAdded)
		{
			--totalLoggedInUsers;
			socket.broadcast.emit('user left_s', {
				username: socket.username,
				numUsers: totalLoggedInUsers
			});
		}
	});
		 
	//util to delete
	function printObject(o) {
		var out = '';
		for (var p in o) {
		out += p + ': ' + o[p] + '\n';
		}
  	console.log(out);
	}
});
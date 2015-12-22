$(function () {
	//the socket.io client side init
	var socket = io();
	
	//UI variables
	var $userInput = $('#message-box');

	//username
	var userName = '';
	
	//init page by hiding chat section which will be shown on username submit
	$('#chatSection').hide();
		
	//socket event listeners
	//on connection
	socket.on('init', function (data) {
		updateUserCount(data);
	});

	//new message from server
	socket.on('new message_s', function (data) {
		addOthersChatMessage(data);
	});
	
	//new user from server
	socket.on('user joined_s', function (userNameData) {
		updateUserCount(userNameData.onlineUsers);
		addUserJoinedMessage(userNameData.userName);
	});

	socket.on('user left_s', function (userNameData) {
		updateUserCount(userNameData.numUsers);
		addUserLeftMessage(userNameData.username);
	});
	
	//event emitters
	function sendMessageUsingSocket(message) {
		socket.emit('new message_c', {
			username: userName,
			message: message
		});
	}

	function emitUserName(userName) {
		socket.emit('new user_c', userName);
	}

	//what to do on socket events	
	function addChatMessage(data, isOther) {
		var $latestMessageElement;
		var message = '';
		if (isOther) {
			message = data.message;
			$latestMessageElement = createLiElement(message, data.username);
		}
		else {
			message = data;
			$latestMessageElement = createLiElement(message);
			$latestMessageElement.addClass('msgFromSelf');
		}
		$latestMessageElement.appendTo("#chatList");
		$userInput.val('');
		$("#messages").scrollTop($("#messages")[0].scrollHeight);
	}

	function addOthersChatMessage(data) {
		addChatMessage(data, true);
	}

	function updateUserCount(userCount) {
		$('#userCount').text(userCount + " users online");
	}

	function addUserJoinedMessage(uName) {
		var $latestMessageElement = createLiElement(uName + ' has just joined');
		$latestMessageElement.appendTo("#chatList");
	}

	function addUserLeftMessage(uName) {
		var $latestMessageElement = createLiElement(uName + ' has just left');
		$latestMessageElement.appendTo("#chatList");
	}

	function createLiElement(text, badge) {
		var $latestMessageElement = $('<li>').addClass('list-group-item');
		$latestMessageElement.text(text);
		if (badge) {
			$latestMessageElement.append("<span class=\"badge\">" + badge + "</span>");
		}
		return $latestMessageElement;
	}

	//events using jquery
	$('#send-message-btn').click(function () {
		var message = $userInput.val();
		if (message) {
			addChatMessage(message);
			sendMessageUsingSocket(message);
		}
		else {
			$('#inputEmptyAlertContainer').show(2000);
		}
	});

	$('#userNameSubmit').click(function () {
		userName = $('#userName').val();
		if (userName) {
			emitUserName(userName);
			$('.userNameInputGroup').hide();
			$('#userNameOutputGroup').text('Hi ' + userName);
			$('#userNameOutputGroup').show(2000);
			$('#userNameErrorAlert').hide();
			$('#chatSection').show();
		}
		else {
			$('#userNameErrorAlert').show();
		}

	});

	$userInput.keyup(function () {
		if ($userInput.val()) {
			$('#inputEmptyAlertContainer').hide(2000);
		}
	});
});

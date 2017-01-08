/*eslint-env browser*/
/* globals SOCKET, USER, siteUrl, ENV*/
$(function (){
  // $SCROLL.scrollTop( $SCROLL[0].scrollHeight);
  SOCKET.on("connect", function (){
    if (USER !== ""){
      SOCKET.emit( 'regist', { secret: USER});
    }
  });

  SOCKET.on('msgOut', function (data) {
    receive(data);
  });

  SOCKET.on('disconnect', function (){
    if ( ENV === "production" ) { 
      document.location.href = "/login";
    }
  });

  $(".msgEnter input").keypress( function (e){
    var code = e.keyCode ? e.keyCode : e.which;
    var $this = $(this);
    if ( code === 13 && $this.val().trim() !== ""){
      sendMsg( SOCKET, $this.val(), $this.data("target"));
      $this.val("");
    }
  });

  $(".friends").on( "click", function(){
    var $this = $(this);
    var target = $this.data("target");
    var $targetRoom = $("#"+target);
    $(".msgEnter input").data("target", $this.data("target")).attr("placeholder", "Write a message...").attr("disabled",false);
    $(".block-content .content").css("display", "none");
    $("#"+target).css("display", "block");
    getMessages( $this.data("roomid"), 0, 1500, function ( result){
      var from = "<li class=\"row from\"><span class=\"bubble\"></span></li>";
      var to = "<li class=\"row to\"><span class=\"bubble\"></span></li>";
      for ( var i = 0, imax = result.length; i < imax; i+=1) {
        if ( result[i].from === target) {
          $targetRoom.find("ul").append( to).find(".to .bubble:last").text( result[i].content);
        } else {
          $targetRoom.find("ul").append( from).find(".from .bubble:last").text( result[i].content);
        }
      }
      $targetRoom.scrollTop( $targetRoom[0].scrollHeight);
    });
  });
});

function sendMsg( SOCKET, msg, target) {
  var from = "<li class=\"row from\"><span class=\"bubble\"></span></li>";
  var $target = $("#"+ target);
  $target.find("ul").append(from).find(".from .bubble:last").text(msg);
  $target.scrollTop( $target[0].scrollHeight);
  SOCKET.emit('msgIn', { target: target, from: USER, msg: msg});
}

function receive(data){
  var to = "<li class=\"row to\"><span class=\"bubble\"></span></li>";
  var $from = $("#"+ data.from);
  $from.find("ul").append(to).find(".to .bubble:last").text(data.msg);
  $from.scrollTop( $from[0].scrollHeight);
  if (Notification.permission === "granted") {
    notifyMe( "xChat", "您有新的訊息");
  }
}

function getMessages ( roomId, from, count, callback) {
  $.ajax({
    method: "GET",
    url: "messages",
    dateType: "json",
    data: { roomId: roomId, from: from, count: count},
    success: function ( result) {
      callback( result);
    },
    error: function ( err){
      console.error( err);
    }
  });
}

function notifyMe( title, content) {
  var notification = new Notification( title, {
    // icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
    body: content,
  });

  notification.onclick = function () {
    window.open( siteUrl);
  };
}

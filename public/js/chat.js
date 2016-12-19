/*eslint-env browser*/
/* globals $scroll, socket, user*/
$(function (){
  // $scroll.scrollTop( $scroll[0].scrollHeight);
  socket.on("connect", function (){
    if (user !== ""){
      socket.emit( 'regist', { secret: user});
    }
  });
  socket.on('msgOut', function (data) {
    receive(data);
  });
  socket.on('disconnect', function (){
    document.location.href="/login";
  });

  $(".msgEnter input").keypress( function (e){
    var code = e.keyCode ? e.keyCode : e.which;
    var $this = $(this);
    if ( code === 13 && $this.val().trim() !== ""){
      sendMsg( socket, $this.val(), $this.data("target"));
      $this.val("");
    }
  });
  $(".friends").on( "click", function(){
    var $this = $(this);
    $(".msgEnter input").data("target", $this.data("target")).attr("placeholder", "Write a message...").attr("disabled",false);
    console.log("switch target to " + $this.data("target"));
  });
});

function sendMsg( socket, msg, target) {
  var from = "<li class=\"row from\"><span class=\"bubble\">"+ msg +"</span></li>";
  $(".content ul").append(from);
  $scroll.scrollTop( $scroll[0].scrollHeight);
  socket.emit('msgIn', { target: target, from: user, msg: msg});
}
function receive(data){
  var to = "<li class=\"row to\"><span class=\"bubble\">"+ data.msg +"</span></li>";
  $(".content ul").append(to);
  $scroll.scrollTop( $scroll[0].scrollHeight);
}


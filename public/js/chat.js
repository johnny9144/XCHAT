/*eslint-env browser*/
/* globals $SCROLL, SOCKET, USER*/
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
    document.location.href="/login";
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
    $(".msgEnter input").data("target", $this.data("target")).attr("placeholder", "Write a message...").attr("disabled",false);
    console.log("switch target to " + $this.data("target"));
  });
});

function sendMsg( SOCKET, msg, target) {
  var from = "<li class=\"row from\"><span class=\"bubble\">"+ msg +"</span></li>";
  $(".content ul").append(from);
  $SCROLL.scrollTop( $SCROLL[0].scrollHeight);
  SOCKET.emit('msgIn', { target: target, from: USER, msg: msg});
}
function receive(data){
  var to = "<li class=\"row to\"><span class=\"bubble\">"+ data.msg +"</span></li>";
  $(".content ul").append(to);
  $SCROLL.scrollTop( $SCROLL[0].scrollHeight);
}


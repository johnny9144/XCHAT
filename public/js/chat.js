/*eslint-env browser*/
/* globals $SCROLL, SOCKET, USER, ENV*/
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
    if ( !USER && ENV === "production") {
      document.location.href="/login";
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
    $(".msgEnter input").data("target", $this.data("target")).attr("placeholder", "Write a message...").attr("disabled",false);
    $(".block-content .content").css("display", "none");
    $("#"+$this.data("target")).css("display", "block");
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
}


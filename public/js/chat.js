/*eslint-env browser*/
/* globals SOCKET, USER, siteUrl, ENV, flashTitle, hljs, autosize */
$(function (){
  $(".msgEnter .fmenu span").tooltipster({
    theme: "tooltipster-borderless"
  });

  $(".msgEnter .functions").on( "mouseleave mouseenter", function () {
    $(".msgEnter .fmenu").slideToggle("fast");
  });

  $(".chat").height($(".chat").width() * 0.58);
  var bodyHeight = $("body").height();

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
      sendMsg( SOCKET, $this.val(), $this.closest(".msgEnter").data("target"), "text");
      $this.val("");
    }
  });

  $("#pasteCode").on( "click", function () {
    var select = "<select>"
      + "<option value=\"Auto\">Auto</option>"
      + "<option value=\"JavaScript\">JavaScript</option>"
      + "<option value=\"HTML\">HTML</option>"
      + "<option value=\"XML\">XML</option>"
      + "<option value=\"JSON\">JSON</option>"
      + "<option value=\"Markdown\">Markdown</option>"
      + "<option value=\"PHP\">PHP</option>"
      + "<option value=\"Apache\">Apache</option>"
      + "<option value=\"SQL\">SQL</option>"
      + "<option value=\"Bash\">Bash</option>"
      + "<option value=\"C#\">C#</option>"
      + "<option value=\"C++\">C++</option>"
      + "<option value=\"CSS\">CSS</option>"
      + "<option value=\"CoffeeScript\">CoffeeScript</option>"
      + "<option value=\"Diff\">Diff</option>"
      + "<option value=\"HTTP\">HTTP</option>"
      + "<option value=\"Ini\">Ini</option>"
      + "<option value=\"Java\">Java</option>"
      + "<option value=\"Makefile\">Makefile</option>"
      + "<option value=\"Nginx\">Nginx</option>"
      + "<option value=\"Objective-C\">Objective-C</option>"
      + "<option value=\"Perl\">Perl</option>"
      + "<option value=\"Python\">Python</option>"
      + "<option value=\"Ruby\">Ruby</option>"
      + "</select>";

    $("<pre title=\"Paste\">Language: "+ select +"<textarea class=\"codeText\" placeholder=\"Paste your code here!\"></textarea></pre>").dialog({
      resizable: true,
      height: "auto",
      maxHeight: bodyHeight * 0.8,
      width: "50%",
      modal: true,
      autoOpen: true,
      buttons: {
        Ok: function() {
          var $this = $( this );
          $.ajax({
            url: "/api/sendCode",
            method: "POST",
            dataType: "json",
            data: { type: $this.find("select").val(), content: $this.find(".codeText").val() }
          })
          .done( function ( result) {
            sendMsg( SOCKET, result.url, $(".msgEnter").data("target"), "code");
            $this.dialog( "close" );
          })
          .fail( function ( err) {
            console.log( "ERROR" + err);
            alert( "ERROR");
          });
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      open: function() {
        autosize( $( this ).find("textarea"));
      }
    });
  });

  $( ".block-content").on( "click", "span.code", function () {
    var $this = $(this);
    var timestamp = new Date().getTime();
    var url = $this.data("url");
    $.ajax({
      url: '/api/code?url=' + url,
      dataType: 'json',
      method: 'get'
    }).done(function ( response) {
      $("<pre title=\"Language: "+ response.type +"\"><code id=\""+ timestamp +"\"class=\""+ response.type +"\"></code></pre>").find("code").text( response.content).closest("pre").dialog({
        resizable: true,
        height: "auto",
        maxHeight: bodyHeight * 0.8,
        width: "50%",
        modal: true,
        autoOpen: true,
        buttons: {
          Ok: function() {
            $( this ).dialog( "close" );
          }
        },
        close: function () {
          $("#"+ timestamp).remove();
        }
      });
      hljs.highlightBlock( $("#"+ timestamp)[0]);
    }).fail(function( err){
      console.log( err);
      alert ( "ERROR");
    });
  });

  $(".friends").on( "click", function(){
    var $this = $(this);
    var target = $this.data("target");
    var $targetRoom = $("#"+target);
    $(".msgEnter").data("target", $this.data("target"));
    $(".msgEnter input").attr("placeholder", "Write a message...");
    $(".msgEnter").css( "display", "block");
    $(".functions .icon").css("font-size", $(".functions").width());
    $("#pasteCode").css("font-size", $(".functions").width() * 0.625);
    $(".block-content .content").css("display", "none");
    if( !$targetRoom.length ) {
      $targetRoom = $("<div class=\"row content none\" id=\""+ target +"\"><ul></ul></div>").prependTo($(".block-right"));
      getMessages( $this.data("roomid"), 0, 1500, function ( result) {
        var from = "<li class=\"row from\"><span class=\"bubble\"></span></li>";
        var to = "<li class=\"row to\"><span class=\"bubble\"></span></li>";
        for ( var i = 0, imax = result.length; i < imax; i+=1) {
          if ( result[i].from === target) {
            if ( result[i].type && result[i].type !== "text") {
              $targetRoom.find("ul").append( to).find(".to .bubble:last").append( "<span class=\"glyphicon glyphicon-file code\" data-url=\""+ result[i].content +"\"></span>");
            } else {
              $targetRoom.find("ul").append( to).find(".to .bubble:last").text( result[i].content);
            }
          } else {
            if ( result[i].type && result[i].type !== "text") {
              $targetRoom.find("ul").append( from).find(".from .bubble:last").append( "<span class=\"glyphicon glyphicon-file code\" data-url=\""+ result[i].content +"\"></span>");
            } else {
              $targetRoom.find("ul").append( from).find(".from .bubble:last").text( result[i].content);
            }
          }
        }
        $targetRoom.scrollTop( $targetRoom[0].scrollHeight);
      });
    }
    $targetRoom.css("display", "block");
  });
  $( window).on("focus", function () {
    clearInterval( flashTitle);
    flashTitle = "";
    document.title = "Coox";
  });
});

function sendMsg( SOCKET, msg, target, type) {
  var from = "<li class=\"row from\"><span class=\"bubble\"></span></li>";
  var $target = $("#"+ target);
  if ( type && type !== "text") {
    $target.find("ul").append(from).find(".from .bubble:last").append( "<span class=\"glyphicon glyphicon-file code\" data-url=\""+ msg +"\"></span>");
  } else {
    $target.find("ul").append(from).find(".from .bubble:last").text(msg);
  }
  $target.scrollTop( $target[0].scrollHeight);
  SOCKET.emit('msgIn', { target: target, from: USER, msg: msg, type: type});
}

function receive(data){
  var to = "<li class=\"row to\"><span class=\"bubble\"></span></li>";
  var $from = $("#"+ data.from);
  console.dir( data);
  if ( data.type && data.type !== "text") {
    $from.find("ul").append(to).find(".to .bubble:last").append( "<span class=\"glyphicon glyphicon-file code\" data-url=\""+ data.msg +"\"></span>");
  } else { 
    $from.find("ul").append(to).find(".to .bubble:last").text( data.msg);
  }
  $from.scrollTop( $from[0].scrollHeight);
  if ( Notification.permission === "granted") {
    notifyMe( "Coox", "您有新的訊息");
  }
  if (!flashTitle) {
    flashTitle = setInterval( function () {
      if ( document.title === "Coox") {
        document.title = "you have messages";
      } else {
        document.title = "Coox";
      }
    }, 1000 * 2);
  }
}

function getMessages ( roomId, from, count, callback) {
  $.ajax({
    method: "GET",
    url: "/api/messages",
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

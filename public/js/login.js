/*eslint-env browser*/
/* globals */
$(function (){
  $("button.login").on( "click", valid);
  $("button.registrar").on( "click", function () {
    document.location.href("/regist");
  });
});

function valid (e) {
  e.preventDefault();
  var $user = $("input[type=\"email\"]");
  var $pass = $("input[type=\"password\"]");
  if ( !$user || $user.val() === "") {
    $(".user").effect( "shake" );
  }
  if ( !$pass || $pass.val() === "") {
    $(".pass").effect( "shake"); 
    return;
  } 
  $(".load").fadeOut("fast").animsition();
  return login ( $user.val(), $pass.val());
}

function login ( user, pass) {
  $.ajax({
    url: "/login",
    method: "POST",
    data: { username: user, password: pass},
    dataType: "json",
    timeout: 1000 * 10,
    success: function ( result) {
      if ( result.code === 200 && result.data){
        location.href = "/home";
      } else {
        $(".load").fadeIn("slow").animsition('in');
        $(".msg").html("<span class=\"glyphicon glyphicon-exclamation-sign\"></span>&nbsp;&nbsp;帳號或密碼錯誤，請重新輸入").css( "display", "inline-block").effect("shake");
      }
    },
    error: function ( err) {
      console.log( err);
      $(".load").fadeIn("slow").animsition('in');
      $(".msg").css( "display", "inline-block").effect("shake");
    }
  });
}



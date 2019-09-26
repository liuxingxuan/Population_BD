$(function () {
    $("#txtUser").keydown(function (e) {
        if (e.keyCode == 13 || e.keyCode == 40) {
            $("#txtPass").focus()
        }
    })
    $("#txtPass").keydown(function (e) {
        if (e.keyCode == 13) {
            $("#button").trigger('click');
        } else if (e.keyCode == 38) {
            $("#txtUser").focus()
        }
    })
    $("#button").on("click", function () {
        var user = $("#txtUser").val();
        var pass = $("#txtPass").val();
        $.ajax({
            cache: false,
            type: "get",
            url: serviceHost + "Login?username=" + user + "&password=" + pass,
            scriptCharset: 'UTF-8',
            dataType: "json",
            async: false,
            success: function (response) {
                response = eval("(" + response + ")")
                if (response.result == "ok") {
                    var data = eval("(" + response.data + ")")
                    //console.log(data)
                    sessionStorage['user'] = data[0]['Username'];
                    sessionStorage['role'] = data[0]['Role'];
                    if(data[0]['Role'] == 'district'){
                        sessionStorage['roleDetail'] = data[0]['RoleDetail'];
                    } else {
                        sessionStorage['roleDetail'] = ""
                    }
                    window.location.href = "index.html"
                } else {
                    alert(response.data);
                }
            }
        })
    })
})
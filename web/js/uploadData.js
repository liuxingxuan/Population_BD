//日期原型拓展-格式化
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

var uploadFileList = {};

$(function () {
    if (sessionStorage['role'] !== 'admin') {
        window.location.href = "login.html";
    }

    $('.logOut').on('click', function () {
        sessionStorage['user'] = "";
        sessionStorage['role'] = "";
        sessionStorage['roleDetail'] = ""
        window.location.href = "login.html";
    })

    $('.userText').text(sessionStorage['user']);

    //阻止浏览器默认行为。 
    $(document).on({
        dragleave: function (e) {    //拖离 
            e.preventDefault();
        },
        drop: function (e) {  //拖后放 
            e.preventDefault();
        },
        dragenter: function (e) {    //拖进 
            e.preventDefault();
        },
        dragover: function (e) {    //拖来拖去 
            e.preventDefault();
        }
    });

    $('.leftMenuItem').on('click', function () {
        var _this = this;
        var ov = $('.leftMenuItem.selected').attr('value');
        var nv = $(this).attr('value');
        if (ov !== nv) {
            $('.mainContainer').fadeOut(100, function () {
                $('.mainContainer').empty();
                $(_this).addClass('selected');
                $(_this).siblings().removeClass("selected");
                $('.mainContainer').fadeIn(100, function () {
                    if (nv == 'upload') {
                        showUpload();
                    } else if (nv == 'history') {
                        showHistory();
                    } else if (nv == 'user') {
                        showUser();
                    }
                });
            });
        }
    })

    function showUpload() {
        var html = " <input id='uploadInput' type='file' />\
        <div id='dropBox'>将文件拖拽到此处以进行上传</div>\
        <div class='uploadFile'>\
            <span style='margin-left:0.5vw'>更新方式：</span>\
            <select class='uploadSelect'>\
                <option value='upload'>更新</option>\
                <option value='edit'>修改</option>\
            </select>\
            <span></span>\
            <div class='downloadMB'>\
            <select id='mbName' class='uploadSelect'>\
            </select>\
            <div id='download' class='Button' style='margin:0vh 0.5vw'>模板下载</div></div>\
            <div class='Button' style='margin:0vh 0.5vw' id='selectFile'>选择文件</div>\
            <div class='Button' style='margin:0vh 0.5vw' id='uploadButton'>开始上传</div>\
        </div>\
        <div class='uploadResult'>\
            <div class='uploadResultTitle'><span>上传队列</span></div>\
            <div class='uploadResultMain'>\
                <table class='uploadTable'>\
                    <thead>\
                        <tr>\
                            <th class='col1'>文件名</th>\
                            <th class='col2'>大小</th>\
                            <th class='col3'>修改日期</th>\
                            <th class='col4'>进度</th>\
                        </tr>\
                    </thead>\
                    <tbody>\
                    </tbody>\
                </table>\
            </div>\
        </div>"
        $('.mainContainer').append(html);

        $('#selectFile').on('click', function () {
            $("#uploadInput").click();
        })
        $('#uploadInput').on('change', function () {
            var file = document.getElementById("uploadInput").files[0];
            console.log(file)
            var name = file.name;
            var date = new Date(file.lastModified).format('yyyy-MM-dd hh:mm:ss')
            var size = file.size / 1024;
            var sizeUnit = 'kb'
            if (size > 1024) {
                size = size / 1024
                sizeUnit = 'mb'
            }
            size = size.toFixed(1);
            var result = '';
            if (file.name.slice(-4) !== 'xlsx') {
                result = "失败！上传的文件必须为.xlsx文件！";
            }
            if ($('#' + name).length > 0) {
                alert('存在同名文件！');
                return
            }
            $('tr#' + name.split('.')[0]).remove();
            var html = '<tr id="' + name.split('.')[0] + '">'
            html += '<td class="col1">' + name + '</td>'
            html += '<td class="col2">' + size + sizeUnit + '</td>'
            html += '<td class="col3">' + date + '</td>'
            html += '<td class="col4">' + result + '</td>'
            html += '</tr>'
            $('.uploadResult table tbody').append(html);
            uploadFileList[name] = file;
        })
        $('#uploadButton').on('click', function () {
            if($.isEmptyObject(uploadFileList)){
                alert('没有可以上传的文件！');
                return
            }
            for(var i in uploadFileList){
                var file = uploadFileList[i];
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.name = file.name
                $('tr#' + i.split('.')[0]).find('.col4').text('开始上传...');
                reader.onload = function () {
                    if (this.readyState !== 2 || this.error) {
                        return;
                    } else {
                        var l = this.result.byteLength
                        var file = this;
                        var name = this.name;
                        $.ajax({
                            type: 'POST',
                            url: serviceHost + "uploadfile?filename=" +
                                name + "&streamLength=" + l,
                            data: file.result,
                            processData: false,
                            contentType: false,
                            success: function (response) {
                                //alert('success!')
                                $('tr#' + i.split('.')[0]).find('.col4').text('检查中...');
                                checkFile(name);
                            },
                            error: function (response) {
                                $('tr#' + i.split('.')[0]).find('.col4').text(response.responseText);
                            }
                        });
                    }
                };
            }
        })

        for (var i in tableList) {
            var html = "<option value='" + tableList[i][1] + "'>" + tableList[i][1] + "</option>"
            $('#mbName').append(html);
        }
        $('#download').on('click', function () {
            var file = $('#mbName').val() + ".xlsx";
            window.open(host + 'web/data/moban/' + file);
        })

        var box = document.getElementById('dropBox'); //拖拽区域 

        box.addEventListener("drop", function (e) {
            e.preventDefault(); //取消默认浏览器拖拽效果 
            var fileList = e.dataTransfer.files; //获取文件对象 
            //检测是否是拖拽文件到页面的操作 
            if (fileList.length == 0) {
                return false;
            }
            $('.uploadResult table tbody').empty();
            for (var i = 0; i < fileList.length; i++) {
                var file = fileList[i];
                var name = file.name;
                var date = new Date(file.lastModified).format('yyyy-MM-dd hh:mm:ss')
                var size = file.size / 1024;
                var sizeUnit = 'kb'
                if (size > 1024) {
                    size = size / 1024
                    sizeUnit = 'mb'
                }
                size = size.toFixed(1);
                var result = '';
                if (file.name.slice(-4) !== 'xlsx') {
                    result = "失败！上传的文件必须为.xlsx文件！";
                }
                if ($('#' + name).length > 0) {
                    alert('存在同名文件！');
                    continue;
                }
                $('tr#' + name.split('.')[0]).remove();
                var html = '<tr id="' + name.split('.')[0] + '">'
                html += '<td class="col1">' + name + '</td>'
                html += '<td class="col2">' + size + sizeUnit + '</td>'
                html += '<td class="col3">' + date + '</td>'
                html += '<td class="col4">' + result + '</td>'
                html += '</tr>'
                $('.uploadResult table tbody').append(html);
                uploadFileList[name] = file;
            }
        }, false);
    }

    function showHistory() {
        var html = "<div class='histroyTimeContaienr'>\
                        <span style='margin-right:1vw'>开始时间</span>\
                        <input id='st' type='text' style='width:15%'>\
                        <span style='margin-left:2vw;margin-right:1vw''>结束时间</span>\
                        <input id='et' type='text' style='width:15%'>\
                        <div class='searchButton Button'>查询</div>\
                    </div>\
                    <div class='historyTable'>\
                        <table class='uploadTable'>\
                            <thead>\
                                <tr>\
                                    <th class='col1'>序号</th>\
                                    <th class='col2'>上传时间</th>\
                                    <th class='col3'>文件名</th>\
                                    <th class='col4'>上传用户</th>\
                                    <th class='col5'>操作类型</th>\
                                    <th class='col6'>上传结果</th>\
                                    <th class='col7'>详情</th>\
                                </tr>\
                            </thead>\
                            <tbody>\
                            </tbody>\
                        </table>\
                    </div>"
        $('.mainContainer').append(html);
        var et = new Date().format('yyyy-MM-dd 23:59');
        var st = new Date().format('yyyy-MM-dd 00:00');
        $('#st').datetimebox({
            value: st,
            required: true,
            showSeconds: false
        });
        $('#et').datetimebox({
            value: et,
            required: true,
            showSeconds: false
        });

        $('.searchButton').on('click', function () {
            var sst = $('#st').datetimebox('getValue');
            var eet = $('#et').datetimebox('getValue');
            $('.historyTable table tbody').empty();
            var url = serviceHost + "GetUploadLog?st=" + sst + "&et=" + eet;
            $.ajax({
                cache: false,
                type: "Get",
                url: encodeURI(url, "UTF-8"),
                dataType: "json",
                success: function (response) {
                    response = JSON.parse(response);
                    if (response.result == 'ok') {
                        var data = JSON.parse(response.data);
                        for (var i in data) {
                            var index = Number(i) + 1;
                            var time = data[i].Time.replace('T', ' ');
                            var file = data[i].Filename;
                            var user = data[i].UserName;
                            var type = data[i].Type == 'upload' ? '更新' : '修改';
                            var result = data[i].Result == 'ok' ? '成功' : '失败';
                            var detail = data[i].Detail;
                            var html = '<tr>'
                            html += '<td class="col1">' + index + '</td>'
                            html += '<td class="col2">' + time + '</td>'
                            html += '<td class="col3">' + file + '</td>'
                            html += '<td class="col4">' + user + '</td>'
                            html += '<td class="col5">' + type + '</td>'
                            html += '<td class="col6">' + result + '</td>'
                            html += '<td class="col7">' + detail + '</td>'
                            html += '</tr>'
                            $('.historyTable table tbody').append(html);
                        }
                    }
                }
            })
        })
        $('.searchButton').click();
    }

    function showUser() {
        var html = "<div class='uploadResult'><div class='uploadResultTitle'><span value='info'>用户信息</span><span value='add'>新增用户</span></div><div class='uploadResultMain userInfo'></div></div>";
        $('.mainContainer').append(html);
        $('.uploadResult').css('margin-top', 0);
        $('.uploadResultTitle span').on('click', function () {
            $('.uploadResultMain').empty();
            var v = $(this).attr('value');
            if (v == 'info') {
                showUserInfo();
            } else if (v == 'add') {
                showUserAdd();
            }
        })
        $('.uploadResultTitle span:first').trigger('click');
    }

    $('.leftMenuItem:first').click();

    function checkFile(name) {
        var url = serviceHost + "checkUploadFile?fileName=" +
            name + "&table=" + name.split(".")[0];
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = JSON.parse(response);
                if (response == "") {
                    $('tr#' + name.split('.')[0]).find('.col4').text('检查中...');
                    analyzeFile(name);
                } else {
                    $('tr#' + name.split('.')[0]).find('.col4').text(response);
                    delete uploadFileList[name];
                }
            }
        })
    }

    function analyzeFile(name) {
        var type = $('.uploadSelect').val();
        var url = serviceHost + "analyzeFile?fileName=" +
            name + "&type=" + type + "&user=" + sessionStorage['user'];
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                $('tr#' + name.split('.')[0]).find('.col4').text(response);
                delete uploadFileList[name];
                console.log(uploadFileList)
            }
        })
    }

    function showUserInfo() {
        var html = "<div class='userTable'><table id='userTable' class='uploadTable'><thead>\
                        <tr>\
                            <th class='col1'>序号</th>\
                            <th class='col2'>用户名</th>\
                            <th class='col3'>权限</th>\
                            <th class='col4'>详情</th>\
                            <th class='col5'></th>\
                        </tr></thead><tbody></tbody></table></div>";
        $('.uploadResultMain').append(html);
        var url = serviceHost + "GetUser";
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = JSON.parse(response);
                console.log(response)
                if (response.result == 'ok') {
                    var data = JSON.parse(response.data);
                    //console.log(data);
                    for (var i in data) {
                        var index = Number(i) + 1;
                        var user = data[i].username;
                        var role = data[i].role
                        var detail = data[i].roledetail;
                        var html = '<tr>'
                        html += '<td class="col1" value=' + data[i].id + '>' + index + '</td>'
                        html += '<td class="col2">' + user + '</td>'
                        html += '<td class="col3">' + role + '</td>'
                        html += '<td class="col4">' + detail + '</td>'
                        html += '<td class="col5">删除</td>'
                        html += '</tr>'
                        $('.userTable table tbody').append(html);
                    }
                    $('.userTable table tbody .col5').on('click', function () {
                        var _this = this;
                        $('body').append('<div id="mask"></div>')
                        $('#mask').append('<div id="alert"></div>')
                        $('#alert').append('<div class="title">注意</div>')
                        $('#alert').append('<div class="main">是否删除该用户？</div>')
                        $('#alert').append('<div class="bottom"><div class="Button" value="true">确定</div><div class="Button" value="false">取消</div></div>')
                        $('#alert').css({
                            left: ($('body').width() - $('#alert').width()) / 2,
                            top: ($('body').height() - $('#alert').height()) / 2 - 50,
                        })
                        $('#alert .bottom div').on('click', function () {
                            $('#alert').remove();
                            $('#mask').remove();
                            if ($(this).attr('value') == 'true') {
                                var data = $(_this).parent();
                                deleteUser(data);
                            }
                        })
                    })
                }
            }
        })
    }

    function showUserAdd() {
        var html = "<div class='historyTable'>\
            <div id='addContainer'>\
                <div class='addItem'>\
                    <div class='addItemText'>用户名：</div>\
                    <div class='addItemItem'>\
                        <input type='text' id='userName' />\
                    </div>\
                </div>\
                <div class='addItem'>\
                    <div class='addItemText'>密码：</div>\
                    <div class='addItemItem'>\
                        <input type='text' id='password' />\
                    </div>\
                </div>\
                <div class='addItem'>\
                    <div class='addItemText'>权限：</div>\
                    <div class='addItemItem'>\
                        <select id='role'>\
                            <option value='admin'>管理员</option>\
                            <option value='city'>市用户</option>\
                            <option value='district'>区用户</option>\
                        </select>\
                    </div>\
                </div>\
            </div>\
            <div id='submit' class='Button'>确定</div>\
        </div>"
        $('.uploadResultMain').append(html);
        $(".historyTable").css('height', '60vh');
        $('#submit').css('left', ($('body').width() - $('#submit').width()) / 2)
        $('#role').on('change', function () {
            $('#roleDetail').parent().parent().remove();
            var v = $(this).val();
            if (v == 'district') {
                var html = "<div class='addItem'><div class='addItemText'>行政区：</div><div class='addItemItem'><select id='roleDetail'></select></div></div>"
                $("#addContainer").append(html);
                $.getJSON('data/上海区县_GCJ02.json', function (json) {
                    districtJson = json;
                    for (var i in json.features) {
                        var n = json.features[i].properties.NAME;
                        $('#roleDetail').append('<option value="' + n + '">' + n + '</option>')
                    }
                })
            }
        })
        $('#submit').on('click', function () {
            var name = $('#userName').val();
            var pass = $('#password').val();
            var role = $('#role').val();
            var detail = $('#roleDetail').val();
            if (detail == undefined) {
                detail = "";
            }
            var url = serviceHost + "AddUser?name=" + name + "&password=" + pass + "&role=" + role + "&detail=" + detail;
            $.ajax({
                cache: false,
                type: "Get",
                url: encodeURI(url, "UTF-8"),
                dataType: "json",
                success: function (response) {
                    response = JSON.parse(response);
                    if (response.result == 'ok') {
                        alert('添加用户成功！')
                    } else {
                        alert('添加用户失败！')
                        console.log(response);
                    }
                }
            })
        })
    }

    function deleteUser(data) {
        var id = $(data).find('.col1').attr('value');
        var name = $(data).find('.col2').text();
        var url = serviceHost + "DeleteUser?id=" + id + "&user=" + name;
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = JSON.parse(response);
                console.log(response)
                if (response.result == 'ok') {
                    var url1 = serviceHost + "GetUser";
                    $.ajax({
                        cache: false,
                        type: "Get",
                        url: encodeURI(url1, "UTF-8"),
                        dataType: "json",
                        success: function (response) {
                            response = JSON.parse(response);
                            console.log(response)
                            if (response.result == 'ok') {
                                var data = JSON.parse(response.data);
                                $('#userTable').datagrid('loadData', data);
                            }
                        }
                    })
                } else {
                    alert('删除失败！');
                }
            }
        })
    }
}())
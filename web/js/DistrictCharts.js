var DistrictCharts = function () {
    function GetDistrictChartsData(name, time) {
        highlightDistrictEnable = false;
        for (var i in BDClass1Entity) {
            var e = viewer.entities.getById(BDClass1Entity[i]);
            if (e.BDDistrict == name) {
                e.show = true;
            }
        }
        for (var i in BDClass2Entity) {
            var e = viewer.entities.getById(BDClass2Entity[i]);
            if (e.BDDistrict == name) {
                e.show = true;
            }
        }

        highlightDistrictEnable = false;
        $('#ToolBar #district [value=' + name + ']').attr('selected', 'selected');
        getBDByDistrict(name)
        for (var i in districtEntity) {
            for (var n in districtEntity[i]) {
                if (i == name) {
                    viewer.entities.getById(districtEntity[i][n]).show = true;
                } else {
                    viewer.entities.getById(districtEntity[i][n]).show = false;
                }
            }
        }
        $('.DistrictChartsBack').width($('#DistrictCharts1').width() + 5)
        var url = serviceHost + "GetDistrictChartsData?time=" + time + "&name=" + name;
        $('.DistrictCharts').show();
        $('.DistrictCharts').off('click');
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = eval('(' + response + ')');
                console.log(response);

                if (response[0].result == 'ok') {
                    var eCharts1 = echarts.init(document.getElementById('DistrictCharts1'));
                    var eCharts1Cata = [];
                    var eCharts1Data = [];
                    var eCharts1Graphic = [];
                    var DistrictCharts1Data = eval('(' + response[0].data + ')');
                    for (var i = 0; i < 5; i++) {
                        if (DistrictCharts1Data[i]) {
                            eCharts1Cata.push(DistrictCharts1Data[i].Name);
                            eCharts1Data.push({
                                value: Number(DistrictCharts1Data[i].Sum).toFixed(2),
                                name: DistrictCharts1Data[i].Name
                            });
                            eCharts1Graphic.push({
                                type: 'image',
                                left: $('#DistrictCharts1').width() * 0.1 - 14,
                                top: String(18.2 + i * 14) + '%',
                                z: 5,
                                style: {
                                    image: 'img/districtCharts2Arrow.png',
                                }
                            })
                        } else {
                            eCharts1Cata.push('');
                            eCharts1Data.push({
                                value: 0,
                            });
                        }
                    }
                    var option1 = {
                        title: {
                            text: '销 售 TOP5',
                            left: 'center',
                            top: '3%',
                            textStyle: {
                                color: 'rgb(122,225,255)',
                                fontWeight: '800',
                                fontSize: 16,
                                width: '100%',
                                fontFamilt: 'Microsoft YaHei',
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{b} : {c} %"
                        },
                        grid: {
                            top: '15%',
                            bottom: '15%',
                            left: '10%'
                        },
                        xAxis: {
                            type: 'value',
                            axisLine: {
                                lineStyle: {
                                    color: 'rgb(72,124,148)'
                                }
                            },
                            splitLine: {
                                lineStyle: {
                                    color: '#365E69',
                                    type: 'dashed'
                                }
                            },
                            axisLabel: {
                                color: '#fff',
                            }
                        },
                        yAxis: {
                            type: 'category',
                            data: eCharts1Cata,
                            inverse: true,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            }
                        },
                        //graphic: eCharts1Graphic,
                        series: [{
                            type: 'bar',
                            symbolClip: true,
                            barCategoryGap: '60%',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 1, 0,
                                    [
                                        { offset: 1, color: 'rgb(43,156,241)' },
                                        { offset: 0.2, color: 'rgb(50,159,229)' },
                                        { offset: 0, color: 'rgb(80,199,243)' }
                                    ]
                                ),
                            },
                            barWidth: 22,
                            data: eCharts1Data,
                            label: {
                                show: true,
                                position: [20, 6],
                                color: '#fff',
                                fontWeight: 'bold',
                                formatter: '{b}'
                            },
                        }]
                    };
                    eCharts1.setOption(option1);
                    $('#DistrictCharts1').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        });
                        var eCharts1CataFull = [];
                        var eCharts1DataFull = [];
                        for (var i = 0; i < DistrictCharts1Data.length; i++) {
                            eCharts1CataFull.push(DistrictCharts1Data[i].Name);
                            eCharts1DataFull.push({
                                value: Number(DistrictCharts1Data[i].Sum).toFixed(2),
                                name: DistrictCharts1Data[i].Name
                            });
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '销 售 额',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.03,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} %",
                                textStyle: {
                                    fontSize: $('body').height() * 0.025
                                }
                            },
                            grid: {
                                top: '10%',
                                bottom: '10%',
                                left: '10%'
                            },
                            xAxis: {
                                type: 'value',
                                axisLine: {
                                    lineStyle: {
                                        color: 'rgb(72,124,148)'
                                    }
                                },
                                splitLine: {
                                    lineStyle: {
                                        color: '#365E69',
                                        type: 'dashed'
                                    }
                                },
                                axisLabel: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02
                                }
                            },
                            yAxis: {
                                type: 'category',
                                data: eCharts1CataFull,
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                }
                            },
                            series: [{
                                type: 'bar',
                                symbolClip: true,
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(
                                        0, 0, 1, 0,
                                        [
                                            { offset: 1, color: 'rgb(43,156,241)' },
                                            { offset: 0.2, color: 'rgb(50,159,229)' },
                                            { offset: 0, color: 'rgb(80,199,243)' }
                                        ]
                                    ),
                                },
                                barWidth: $('body').height() * 0.05,
                                data: eCharts1DataFull,
                                label: {
                                    show: true,
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    formatter: '{b}',
                                    fontSize: $('body').height() * 0.02
                                },
                            }]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    });
                } else {
                    $('#DistrictCharts1').empty();
                }

                if (response[1].result == 'ok') {
                    $('#DistrictCharts2').empty();
                    var DistrictCharts2Data = eval('(' + response[1].data + ')');
                    $('#DistrictCharts2').append("<div class='chartsTitle'>客 流 TOP5</div>")
                    for (var i = 0; i < 5; i++) {
                        var f = DistrictCharts2Data[i];
                        if(f){
                            if (f.Name.indexOf('-') > -1) {
                                f.Name = f.Name.split('-')[1];
                            }
                            var c = 'third';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            }
                            var html = "<div class='DistrictCharts2Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + f.Name + "</div>";
                            var num = Math.round(f.Sum / DistrictCharts2Data[0].Sum * 10);
                            if(num == 0){
                                num = 1;
                            }
                            for (var x = 0; x < num; x++) {
                                html += "<div class='three d'></div>";
                            }
                            for (var x = 0; x < (10 - num); x++) {
                                html += "<div class='three n'></div>";
                            }
                            $('#DistrictCharts2').append(html)
                        }
                    }
                    $('.DistrictCharts2Item').css('line-height', $('.DistrictCharts2Item').height() + 'px');
                    $('#DistrictCharts2').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        $('#fullScreenCharts').append("<div class='chartsTitle'>客 流</div>")
                        for (var i = 0; i < DistrictCharts2Data.length; i++) {
                            var f = DistrictCharts2Data[i];
                            if (f.Name.indexOf('-') > -1) {
                                f.Name = f.Name.split('-')[1];
                            }
                            var c = 'third';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            }
                            var html = "<div class='DistrictCharts2Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + f.Name + "</div>";
                            var num = Math.round(f.Sum / DistrictCharts2Data[0].Sum * 10);
                            if(num == 0){
                                num = 1;
                            }
                            for (var x = 0; x < num; x++) {
                                html += "<div class='three d'></div>";
                            }
                            for (var x = 0; x < (10 - num); x++) {
                                html += "<div class='three n'></div>";
                            }
                            $('#fullScreenCharts').append(html)
                        }
                        $('#fullScreenCharts .SHCharts2Item').css('line-height', $('.SHCharts2Item').height() + 'px');
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#DistrictCharts2').empty();
                }

                if (response[2].result == 'ok') {
                    var DistrictCharts3Data = eval('(' + response[2].data + ')');
                    DistrictCharts3Data.sort(function (a, b) {
                        return b.Sum - a.Sum
                    })
                    var eCharts3 = echarts.init(document.getElementById('DistrictCharts3'));
                    var eCharts3Cata = [];
                    var eCharts3Data = [];
                    for (var i = 0; i < 5; i++) {
                        if(DistrictCharts3Data[i]){
                            eCharts3Cata.push(DistrictCharts3Data[i].MC);
                            eCharts3Data.push({
                                value: Number(DistrictCharts3Data[i].Sum).toFixed(4),
                            });
                        }
                    }
                    var option3 = {
                        title: {
                            text: '转 化 率 TOP5',
                            left: 'center',
                            top: '3%',
                            textStyle: {
                                color: 'rgb(122,225,255)',
                                fontWeight: '800',
                                fontSize: 16,
                                width: '100%',
                                fontFamilt: 'Microsoft YaHei',
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{b} : {c} %"
                        },
                        grid: {
                            top: '20%',
                            left: '10%',
                            bottom: '25%',
                        },
                        xAxis: {
                            type: 'category',
                            data: eCharts3Cata,
                            axisLabel: {
                                color: '#fff',
                                margin: 15,
                                interval: 0,
                                formatter: function (value, index) {
                                    if (index % 2 == 0) {
                                        return '\n\n' + value
                                    } else {
                                        return value
                                    }
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            splitLine: {
                                lineStyle: {
                                    color: '#365E69',
                                    type: 'dashed'
                                }
                            },
                        },
                        series: [{
                            data: eCharts3Data,
                            type: 'bar',
                            symbolClip: true,
                            barCategoryGap: '60%',
                            itemStyle: {
                                color: 'rgb(78,191,251)'
                            },
                            barWidth: $('body').width()*0.015,
                            label: {
                                position: 'top',
                                show: true,
                                color: '#fff'
                            }
                        }]
                    };
                    eCharts3.setOption(option3);
                    $('#DistrictCharts3').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        });
                        var eCharts3CataFull = [];
                        var eCharts3DataFull = [];
                        for (var i = 0; i < DistrictCharts3Data.length; i++) {
                            eCharts3CataFull.push(DistrictCharts3Data[i].MC);
                            eCharts3DataFull.push({
                                value: Number(DistrictCharts3Data[i].Sum).toFixed(4),
                            });
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '转 化 率',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.03,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} %",
                                textStyle: {
                                    fontSize: $('body').height() * 0.025
                                }
                            },
                            grid: {
                                top: '15%',
                                left: '10%',
                                bottom: '25%',
                            },
                            xAxis: {
                                type: 'category',
                                data: eCharts3CataFull,
                                axisLabel: {
                                    color: '#fff',
                                    margin: $('body').height() * 0.04,
                                    rotate: 30,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.02,
                                }
                            },
                            yAxis: {
                                type: 'value',
                                splitLine: {
                                    lineStyle: {
                                        color: '#365E69',
                                        type: 'dashed'
                                    }
                                },
                            },
                            series: [{
                                data: eCharts3DataFull,
                                type: 'bar',
                                symbolClip: true,
                                barCategoryGap: '60%',
                                itemStyle: {
                                    color: 'rgb(78,191,251)'
                                },
                                barWidth: '40%',
                                label: {
                                    position: 'top',
                                    show: true,
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02,
                                }
                            }]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    });
                } else {
                    $('#DistrictCharts3').empty();
                }

                if (response[3].result == 'ok') {
                    var DistrictCharts4Data = eval('(' + response[3].data + ')');
                    var DistrictCharts4LegendData = [];
                    var DistrictCharts4data = [];
                    for (var i = 0; i < 5; i++) {
                        DistrictCharts4LegendData.push(DistrictCharts4Data[i].Industry);
                        DistrictCharts4data.push({
                            name: DistrictCharts4Data[i].Industry,
                            value: Number(DistrictCharts4Data[i].Sum).toFixed(2)
                        });
                    }
                    var eCharts4 = echarts.init(document.getElementById('DistrictCharts4'))
                    option4 = {
                        title: {
                            text: '业 态 占 比 TOP5',
                            left: 'center',
                            top: '3%',
                            textStyle: {
                                color: 'rgb(122,225,255)',
                                fontWeight: '800',
                                fontSize: 16,
                                fontFamilt: 'Microsoft YaHei',
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{b} : {c} %"
                        },
                        grid: {
                            top: '25%',
                            bottom: '5%',
                            left: '10%'
                        },
                        color: ['rgb(128,232,138)', 'rgb(86,117,238)', 'rgb(255,217,83)', 'rgb(176,214,0)', 'rgb(106,229,255)', 'rgb(228,0,127)', 'rgb(255,126,63)', 'rgb(0,160,233)', 'rgb(231,157,255)', 'rgb(149,149,149)', 'rgb(255,79,195)'],
                        legend: {
                            data: DistrictCharts4LegendData,
                            orient: 'vertical',
                            top: '25%',
                            left: '5%',
                            width: '40%',
                            itemGap: 15,
                            padding: 2,
                            itemWidth: 14,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: $(document).width() * 0.008,
                            }
                        },
                        series: [
                            {
                                name: '',
                                type: 'pie',
                                radius: '60%',
                                center: ['65%', '50%'],
                                data: DistrictCharts4data,
                                labelLine: {
                                    show: true,
                                    length: 10,
                                    length2: 0,
                                    lineStyle: {
                                        color: 'rgba(0,0,0,0)'
                                    }
                                },
                                label: {
                                    show: true,
                                    fontWeight: '800',
                                    formatter: function (para) {
                                        return para.percent.toFixed(1) + "%"
                                    }
                                }
                            }
                        ]
                    }
                    eCharts4.setOption(option4);
                    $('#DistrictCharts4').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        });
                        var DistrictCharts4dataFull = [];
                        for (var i = 0; i < DistrictCharts4Data.length; i++) {
                            DistrictCharts4dataFull.push({
                                name: DistrictCharts4Data[i].Industry,
                                value: Number(DistrictCharts4Data[i].Sum).toFixed(2)
                            });
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '业 态 占 比',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.03,
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} %",
                                textStyle: {
                                    fontSize: $('body').height() * 0.025,
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            grid: {
                                top: '25%',
                                bottom: '5%',
                                left: '10%'
                            },
                            color: ['rgb(128,232,138)', 'rgb(86,117,238)', 'rgb(255,217,83)', 'rgb(176,214,0)', 'rgb(106,229,255)', 'rgb(228,0,127)', 'rgb(255,126,63)', 'rgb(0,160,233)', 'rgb(231,157,255)', 'rgb(149,149,149)', 'rgb(255,79,195)'],
                            series: [
                                {
                                    name: '',
                                    type: 'pie',
                                    radius: '65%',
                                    center: ['50%', '55%'],
                                    data: DistrictCharts4dataFull,
                                    labelLine: {
                                        show: true,
                                        length: $('body').height() * 0.04,
                                        length2: 0,
                                        lineStyle: {
                                            color: 'rgba(0,0,0,0)'
                                        }
                                    },
                                    label: {
                                        show: true,
                                        fontWeight: '800',
                                        fontSize: $('body').height() * 0.025,
                                        formatter: function (para) {
                                            return para.name + "：" + para.percent.toFixed(2) + "%"
                                        }
                                    }
                                }
                            ]
                        }
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    });
                } else {
                    $('#DistrictCharts4').empty();
                }

                if (response[4].result == 'ok') {
                    var eCharts5 = echarts.init(document.getElementById('DistrictCharts5'));
                    var DistrictCharts5Cdata = [];
                    var DistrictCharts5data = [];
                    var DistrictCharts5data2 = []
                    var DistrictCharts5Data = eval('(' + response[4].data + ')');
                    for (var i = 0; i < 5; i++) {
                        var d = DistrictCharts5Data[i];
                        if (d) {
                            DistrictCharts5Cdata.push(d.Name);
                            DistrictCharts5data.push(Number(d.Population).toFixed(0));
                            DistrictCharts5data2.push(Number(d.Density));
                        }
                    }
                    var option5 = {
                        title: {
                            text: '人 口 周 边 人 口 TOP5',
                            left: 'center',
                            top: '3%',
                            textStyle: {
                                color: 'rgb(122,225,255)',
                                fontWeight: '800',
                                fontSize: 16,
                                width: '100%',
                                fontFamilt: 'Microsoft YaHei',
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{b} : {c}"
                        },
                        grid: {
                            top: '25%',
                            bottom: '30%',
                        },
                        legend: {
                            data: ['人口', '密度 （人/平方公里）'],
                            top: '15%',
                            itemWidth: 14,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            }
                        },
                        xAxis: {
                            type: 'category',
                            data: DistrictCharts5Cdata,
                            axisLabel: {
                                color: '#fff',
                                margin: 15,
                                interval: 0,
                                formatter: function (value, index) {
                                    var text = ''
                                    for (var i in value) {
                                        if (i % 5 == 0) {
                                            text += '\n' + value[i]
                                        } else {
                                            text += value[i]
                                        }
                                    }
                                    return text
                                }
                            }
                        },
                        yAxis: {
                            type: 'value',
                            splitLine: {
                                lineStyle: {
                                    color: '#365E69',
                                    type: 'dashed'
                                }
                            },
                            name: '比例（%）',
                            nameGap: 25,
                            nameTextStyle: {
                                color: '#fff',
                            },
                            axisLabel: {
                                color: '#fff',
                            }
                        },
                        series: [{
                            name: '人口',
                            data: DistrictCharts5data,
                            type: 'bar',
                            barWidth: $('body').width()*0.015,
                            itemStyle: {
                                color: '#5bb8ff'
                            },
                        },{
                            name: '密度 （人/平方公里）',
                            data: DistrictCharts5data2,
                            type: 'line',
                            symbol: 'circle',
                            symbolSize: 8,
                            lineStyle: {
                                color: '#ffd74e'
                            },
                            itemStyle: {
                                color: '#ffd74e'
                            },
                        }]
                    };
                    eCharts5.setOption(option5);
                    $('#DistrictCharts5').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        });
                        var DistrictCharts5CdataFull = [];
                        var DistrictCharts5dataFull = [];
                        for (var i = 0; i < DistrictCharts5Data.length; i++) {
                            var d = DistrictCharts5Data[i];
                            DistrictCharts5CdataFull.push(d.Name);
                            DistrictCharts5dataFull.push(Number(d.Population).toFixed(0));
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '人 口 周 边 人 口',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height()*0.03,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c}"
                            },
                            grid: {
                                top: '20%',
                                bottom: '20%',
                            },
                            xAxis: {
                                type: 'category',
                                data: DistrictCharts5CdataFull,
                                axisLabel: {
                                    color: '#fff',
                                    margin: $('body').height()*0.04,
                                    interval: 0,
                                    rotate:30,
                                    fontSize:$('body').height()*0.02
                                }
                            },
                            yAxis: {
                                type: 'value',
                                splitLine: {
                                    lineStyle: {
                                        color: '#365E69',
                                        type: 'dashed'
                                    }
                                },
                                name: '比例（%）',
                                nameGap: $('body').height()*0.05,
                                nameTextStyle: {
                                    color: '#fff',
                                    fontSize:$('body').height()*0.025
                                },
                                axisLabel: {
                                    color: '#fff',
                                    fontSize:$('body').height()*0.02
                                }
                            },
                            series: [{
                                name: '人口',
                                data: DistrictCharts5dataFull,
                                type: 'bar',
                                barWidth: '50%',
                                itemStyle: {
                                    color: '#5bb8ff'
                                },
                            }]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    });
                } else {
                    echarts.dispose(document.getElementById('DistrictCharts5'))
                }

                if (response[5].result == 'ok') {
                    $('#DistrictCharts6').empty();
                    var data = eval('(' + response[5].data + ')');
                    $('#DistrictCharts6').append("<div class='chartsTitle'>交 通 便 利 TOP5</div>")
                    for (var i = 0; i < 5; i++) {
                        var f = data[i];
                        if (f) {
                            var c = 'third';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            }
                            var html = "<div class='DistrictCharts6Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + f.Name + "</div>";
                            var num = Math.round(f.Num)
                            var half = Math.round(f.Num) - f.Num;
                            if (half != 0) {
                                half = 1;
                                num -= 1;
                            }
                            for (var x = 0; x < num; x++) {
                                html += "<div class='three d'></div>";
                            }
                            if (half == 1) {
                                html += "<div class='three dhalf'></div>";
                            }
                            for (var x = 0; x < (5 - num - half); x++) {
                                html += "<div class='three n'></div>";
                            }
                            $('#DistrictCharts6').append(html)
                        }
                    }
                    $('.DistrictCharts6Item').css('line-height', $('.DistrictCharts6Item').height() + 'px');
                } else {
                    $('#DistrictCharts6').empty();
                }
            }
        })
    }
    function chartsDistrictHide() {
        if ($('.indexBarItem[value="district"]').hasClass('selected')) {
            highlightDistrictEnable = true;
        }
        $('.DistrictCharts').hide();
        for (var i in BDClass1Entity) {
            var e = viewer.entities.getById(BDClass1Entity[i]);
            e.show = false;
        }
        for (var i in BDClass2Entity) {
            var e = viewer.entities.getById(BDClass2Entity[i]);
            e.show = false;
        }
    }
    function DistrictToolBar() {
        $('#ToolBar').show();
        $('#ToolBar #district,#ToolBar #bd').remove();

        $('#ToolBar').append('<select id="district"></select>')
        for (var i in districtPoint.features) {
            var f = districtPoint.features[i];
            if((sessionStorage['roleDetail'] == f.properties.QX && sessionStorage['role'] == 'district') || (sessionStorage['roleDetail'] == "")){
                $('#ToolBar #district').append('<option value="' + f.properties.QX + '">' + f.properties.QX + '</option>')
            }
        }
        if(sessionStorage['role'] == 'district'){
            for (var i in districtEnveloped.features) {
                var f = districtEnveloped.features[i];
                if (f.properties.Name == sessionStorage['roleDetail']) {
                    var e = f.geometry.coordinates[0];
                    viewer.camera.flyTo({
                        destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
                        duration: 3,
                    });
                }
            }
        }
        $('#ToolBar #district').on('change', function () {
            var d = $(this).val();
            var year = $('#ToolBar #year').val();
            var month = $('#ToolBar #month').val();
            var time = year + '/' + month + '/1';
            for (var i in districtEntity[d]) {
                viewer.entities.getById(districtEntity[d][i]).show = true;
            };
            for (var i in districtEnveloped.features) {
                var f = districtEnveloped.features[i];
                if (f.properties.Name == d) {
                    var e = f.geometry.coordinates[0];
                    viewer.camera.flyTo({
                        destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
                        duration: 3,
                    });
                }
            }

            GetDistrictChartsData(d, time);

            var dname = $(this).val();
            getBDByDistrict(dname);
            hideBD();
            showBD(dname);
        })
        getBDByDistrict($('#ToolBar #district').val());

        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(serviceHost + "GetDistrictDataTime", "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = eval('(' + response + ')');
                $('#ToolBar #year,#ToolBar #month').remove();
                $('#ToolBar').show();
                $('#ToolBar').append('<select id="year"></select>');
                $('#ToolBar').append('<select id="month"></select>');
                for (var i in response.year) {
                    $('#ToolBar #year').append('<option value="' + response.year[i].year + '">' + response.year[i].year + '年</option>')
                }
                for (var i in response.month) {
                    if (i == response.month.length - 1) {
                        $('#ToolBar #month').append('<option selected="selected" value="' + response.month[i].month + '">' + response.month[i].month + '月</option>')
                    } else {
                        $('#ToolBar #month').append('<option value="' + response.month[i].month + '">' + response.month[i].month + '月</option>')
                    }
                }

                $('#ToolBar #year,#ToolBar #month').on('change', function () {
                    var year = $('#ToolBar #year').val();
                    var month = $('#ToolBar #month').val();
                    var time = year + '/' + month + '/1';
                    var name = $('#ToolBar #district').val();
                    GetDistrictChartsData(name, time);
                })
            }
        })
    }

    
    function getBDByDistrict(name) {
        $('#ToolBar #bd').remove();
        $('#ToolBar #district').after('<select id="bd"></select>')
        var url = serviceHost + "GetDistrictBD?name=" + name;
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = eval('(' + response + ')');
                //console.log(response)
                $('#ToolBar #bd').append('<option value=""></option>')
                for (var i in response) {
                    var f = response[i];
                    $('#ToolBar #bd').append('<option value="' + f.Name + '">' + f.Name + '</option>')
                }
                $('#ToolBar #bd').on('change', function () {
                    var b = $(this).val();
                    BDCharts.hide();
                    if (b == "") {
                        return
                    }
                    for (var i in BDClass1Entity) {
                        var bd = BDClass1Entity[i];
                        if (viewer.entities.getById(bd).BDName == b) {
                            clickBDid = viewer.entities.getById(bd).id;
                        }
                    }
                    for (var i in BDClass2Entity) {
                        var bd = BDClass2Entity[i];
                        if (viewer.entities.getById(bd).BDName == b) {
                            clickBDid = viewer.entities.getById(bd).id;
                        }
                    }
                    DistrictCharts.hide();
                    for (var i in BDClass1Entity) {
                        viewer.entities.getById(BDClass1Entity[i]).show = true;
                    }
                    for (var i in BDClass2Entity) {
                        viewer.entities.getById(BDClass2Entity[i]).show = true;
                    }
                    highlightDistrictEnable = false;
                    ClickDistrictEnable = false;
                    ClickBDEnable = true;
                    highlightBDEnbale = true;
                    $('.indexBarItem[value=bd]').addClass('selected');
                    $('.indexBarItem[value=district]').removeClass('selected');
                    setTimeout(function () {
                        BDCharts.toolBar();
                        BDCharts.create(b);
                    }, 250);
                })
            }
        })
    }

    return {
        create: GetDistrictChartsData,
        hide: chartsDistrictHide,
        toolbar: DistrictToolBar
    }
}();
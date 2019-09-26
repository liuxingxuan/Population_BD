var SHCharts = function () {

    function colorMap(color,data,step){
        highlightDistrictEnable = false;
        for (var i in data) {
            var name = data[i].MC
            var c = color[Math.round(Number(data[i].Sum) / step) - 1]
            if(!c){
                c = color[0]
            }
            for (var x in districtEntity) {
                for (var y in districtEntity[x]) {
                    if (x == name) {
                        viewer.entities.getById(districtEntity[x][y]).show = true;
                        if (viewer.entities.getById(districtEntity[x][y]).label){
                            viewer.entities.getById(districtEntity[x][y]).label.show = false;
                        }
                        if (viewer.entities.getById(districtEntity[x][y]).polygon) {
                            viewer.entities.getById(districtEntity[x][y]).polygon.material = Cesium.Color.fromCssColorString(c);
                        }
                    }
                }
            }
        }
        createLegend(color,step);
    }

    function createLegend(color,step){
        $('body').append('<div id="legend"></div>')
        for(var i = 4;i>-1;i--){
            $('#legend').append('<div class="legendItem"><div class="legendItemColor" style="background:' + color[i] + '"></div><div class="legendItemText">' + Number(step*i).toFixed(2) + " ~ " +  Number(step*(i+1)).toFixed(2) + '</div></div>')
        }
    }

    function removeColorMap(){
        highlightDistrictEnable = true;
        $('#legend').remove();
        for (var x in districtEntity) {
            for (var y in districtEntity[x]) {
                viewer.entities.getById(districtEntity[x][y]).show = false;
                if (viewer.entities.getById(districtEntity[x][y]).polygon) {
                    viewer.entities.getById(districtEntity[x][y]).polygon.material = Cesium.Color.fromCssColorString('rgba(74,160,229,0.2)');
                }
                if (viewer.entities.getById(districtEntity[x][y]).label){
                    viewer.entities.getById(districtEntity[x][y]).label.show = true;
                }
            }
        }
    }

    function create() {
        $('.SHChartsBack').width($('#SHCharts1').width() + 5)
        $(".SHCharts").show();
        $(".SHCharts").off('click');
        var url = serviceHost + "GetShanghaiStatisticData?time=2019-03-01"
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = eval('(' + response + ')');
                console.log(response);

                if (response[0].result == 'ok') {
                    var SHCharts1data = JSON.parse(response[0].data);
                    var eCharts1 = echarts.init(document.getElementById('SHCharts1'));
                    var eCharts1Cata = [];
                    var eCharts1Data = [];
                    var eCharts1Graphic = [];
                    for (var i = 0; i < 5; i++) {
                        eCharts1Cata.push(SHCharts1data[i].MC);
                        eCharts1Data.push({
                            value: Number(SHCharts1data[i].Sum).toFixed(2),
                        });
                        eCharts1Graphic.push({
                            type: 'image',
                            left: String(25 - (1500 / $('#SHCharts1').width())) + '%',
                            top: String(18.2 + i * 14) + '%',
                            z: 5,
                            style: {
                                image: 'img/districtCharts2Arrow.png'
                            }
                        });
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
                            left: '25%'
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
                                color: '#fff',
                                margin: 25,
                                interval: 0,
                            }
                        },
                        graphic: eCharts1Graphic,
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
                            data: eCharts1Data
                        }]
                    };
                    eCharts1.setOption(option1);
                    $('#SHCharts1').on('click', function () {
                        $('body').append("<div id='fullScreenCharts' class='leftCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '25%',
                            height: '95%',
                        })
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var eCharts1DataFull = [];
                        var eCharts1CataFull = [];
                        var color = ['rgb(165,210,255)', 'rgb(44,68,90)', 'rgb(43,106,236)', 'rgb(6,65,185)', 'rgb(0,35,78)']
                        var step = Number(SHCharts1data[0].Sum) / 5;
                        var SHCharts1colorMapData = [];
                        for (var i = 0; i < SHCharts1data.length; i++) {
                            eCharts1CataFull.push(SHCharts1data[i].MC);
                            eCharts1DataFull.push({
                                value: Number(SHCharts1data[i].Sum).toFixed(2),
                            });
                            SHCharts1colorMapData.push({
                                MC:SHCharts1data[i].MC,
                                Sum:Number(SHCharts1data[i].Sum)
                            })
                        }
                        colorMap(color,SHCharts1colorMapData,step)
                        var option1Full = {
                            title: {
                                text: '销 售 额',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.02,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} %",
                                textStyle: {
                                    fontSize: $('body').height() * 0.01,
                                }
                            },
                            grid: {
                                top: '8%',
                                bottom: '5%',
                                left: '25%'
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
                                    fontSize: $('body').height() * 0.015
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
                                    color: '#fff',
                                    margin: 25,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.015
                                }
                            },
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
                                data: eCharts1DataFull
                            }]
                        }
                        ec.setOption(option1Full);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                            removeColorMap();
                        })
                    })
                } else {
                    $('#SHCharts1').empty();
                }

                if (response[1].result == 'ok') {
                    var SHCharts2data = JSON.parse(response[1].data);
                    $('#SHCharts2').empty();
                    $('#SHCharts2').append("<div class='chartsTitle'>客 流 TOP5</div>")
                    for (var i = 0; i < 5; i++) {
                        var f = SHCharts2data[i];
                        var c = 'rest';
                        var cc = 'oneString'
                        if (i == '0') {
                            c = 'first'
                        } else if (i == '1') {
                            c = 'second'
                        } else if (i == '2') {
                            c = 'third'
                        }
                        var html = "<div class='SHCharts2Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                        html += "<div class='two'>" + f.MC + "</div>";
                        var num = Math.round(f.Sum / SHCharts2data[0].Sum * 10);
                        if(num == 0){
                            num = 1;
                        }
                        for (var x = 0; x < num; x++) {
                            html += "<div class='three d'></div>";
                        }
                        for (var x = 0; x < (10 - num); x++) {
                            html += "<div class='three n'></div>";
                        }
                        $('#SHCharts2').append(html)
                    }
                    $('.SHCharts2Item').css('line-height', $('.SHCharts2Item').height() + 'px');

                    $('#SHCharts2').on('click', function () {
                        $('body').append("<div id='fullScreenCharts' class='leftCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '25%',
                            height: '95%',
                        })
                        $('#fullScreenCharts').append("<div class='chartsTitle'>客 流</div>");
                        var color = ['rgb(255,215,180)', 'rgb(255,183,97)', 'rgb(246,137,0)', 'rgb(223,84,0)', 'rgb(154,47,0)']
                        var step = Number(SHCharts2data[0].Sum) / 5;
                        var SHCharts2colorMapData = [];
                        for (var i = 0; i < SHCharts2data.length; i++) {
                            SHCharts2colorMapData.push({
                                MC:SHCharts2data[i].MC,
                                Sum:Number(SHCharts2data[i].Sum)
                            })
                            var f = SHCharts2data[i];
                            var c = 'rest';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            } else if (i == '2') {
                                c = 'third'
                            }
                            var html = "<div class='SHCharts2Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + f.MC + "</div>";
                            var num = Math.round(f.Sum / SHCharts2data[0].Sum * 10);
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
                        colorMap(color,SHCharts2colorMapData,step)
                        $('#fullScreenCharts .SHCharts2Item').css('line-height', $('.SHCharts2Item').height() + 'px');
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                            removeColorMap();
                        })
                    })
                } else {
                    $('#SHCharts2').empty();
                }

                if (response[2].result == 'ok') {
                    var SHCharts3data = JSON.parse(response[2].data);
                    SHCharts3data.sort(function (a, b) {
                        return b.Sum - a.Sum
                    })
                    var eCharts3 = echarts.init(document.getElementById('SHCharts3'));
                    var eCharts3Cata = [];
                    var eCharts3Data = [];
                    for (var i = 0; i < 5; i++) {
                        if(SHCharts3data[i]){
                            eCharts3Cata.push(SHCharts3data[i].MC);
                            eCharts3Data.push({
                                value: Number(SHCharts3data[i].Sum).toFixed(2),
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
                            top: '15%',
                            bottom: '20%',
                        },
                        xAxis: {
                            type: 'category',
                            data: eCharts3Cata,
                            axisLabel: {
                                color: '#fff',
                                margin: 25,
                                interval: 0,
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
                            barWidth: 22,
                            label: {
                                normal: {
                                    position: 'top',
                                    show: true,
                                    color: '#fff'
                                }
                            }
                        }]
                    };
                    eCharts3.setOption(option3);

                    $('#SHCharts3').off('click');
                    $('#SHCharts3').on('click', function () {
                        $('body').append("<div id='fullScreenCharts' class='leftCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '25%',
                            height: '95%',
                        })
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var eCharts3CataFull = [];
                        var eCharts3DataFull = [];
                        var color = ['rgb(180,255,205)', 'rgb(72,214,93)', 'rgb(0,181,26)', 'rgb(0,131,18)', 'rgb(0,89,13)']
                        var step = Number(SHCharts3data[0].Sum) / 5;
                        var SHCharts3colorMapData = [];
                        for (var i = 0; i < SHCharts3data.length; i++) {
                            eCharts3CataFull.push(SHCharts3data[i].MC);
                            eCharts3DataFull.push({
                                value: Number(SHCharts3data[i].Sum).toFixed(2),
                            });
                            SHCharts3colorMapData.push({
                                MC:SHCharts3data[i].MC,
                                Sum:SHCharts3data[i].Sum
                            })
                        }
                        
                        var option3Full = {
                            title: {
                                text: '转 化 率',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.02,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} %",
                                textStyle: {
                                    fontSize: $('body').height() * 0.01,
                                }
                            },
                            grid: {
                                top: '8%',
                                bottom: '5%',
                                left: '25%'
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
                                    fontSize: $('body').height() * 0.015
                                }
                            },
                            yAxis: {
                                type: 'category',
                                data: eCharts3CataFull,
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    color: '#fff',
                                    margin: 25,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.015
                                }
                            },
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
                                data: eCharts3DataFull
                            }]
                        };
                        ec.setOption(option3Full);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();

                        })
                    })
                } else {
                    $('#SHCharts3').empty();
                }

                if (response[3].result == 'ok') {
                    var SHCharts4data = JSON.parse(response[3].data);
                    SHCharts4LegendData = [];
                    SHCharts4d = [];
                    for (var i = 0; i < 5; i++) {
                        SHCharts4LegendData.push(SHCharts4data[i].Industry);
                        SHCharts4d.push({
                            name: SHCharts4data[i].Industry,
                            value: Number(SHCharts4data[i].Sum).toFixed(2)
                        });
                    }
                    var eCharts4 = echarts.init(document.getElementById('SHCharts4'))
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
                            data: SHCharts4LegendData,
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
                                center: ['60%', '50%'],
                                data: SHCharts4d,
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
                    $('#SHCharts4').off('click');
                    $('#SHCharts4').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '25%',
                            height: '95%',
                            right: '0%'
                        })
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var eCharts4CataFull = [];
                        var eCharts4DataFull = [];
                        for (var i = 0; i < SHCharts4data.length; i++) {
                            eCharts4CataFull.push(SHCharts4data[i].Industry);
                            eCharts4DataFull.push({
                                value: Number(SHCharts4data[i].Sum).toFixed(2),
                            });
                        }
                        var option4Full = {
                            title: {
                                text: '业 态 占 比',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.02,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c} %",
                                textStyle: {
                                    fontSize: $('body').height() * 0.01,
                                }
                            },
                            grid: {
                                top: '8%',
                                bottom: '5%',
                                left: '25%'
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
                                    fontSize: $('body').height() * 0.015
                                }
                            },
                            yAxis: {
                                type: 'category',
                                data: eCharts4CataFull,
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    color: '#fff',
                                    margin: 25,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.015
                                }
                            },
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
                                data: eCharts4DataFull
                            }]
                        };
                        ec.setOption(option4Full);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#SHCharts4').empty();
                }

                if (response[4].result == 'ok') {
                    var SHCharts5data = JSON.parse(response[4].data);
                    var eCharts5 = echarts.init(document.getElementById('SHCharts5'));
                    var SHCharts5Cdata = [];
                    var SHCharts5data1 = [];
                    var SHCharts5data2 = [];
                    for (var i in SHCharts5data) {
                        var d = SHCharts5data[i];
                        SHCharts5Cdata.push(d.MC.substring(0, 2));
                        SHCharts5data1.push(Number(d.Population).toFixed(0));
                        SHCharts5data2.push(Number(d.Density));
                    }
                    var option5 = {
                        title: {
                            text: '常 住 人 口',
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
                            top: '18%',
                            bottom: '30%',
                        },
                        legend: {
                            data: ['人口', '密度 （人/平方公里）'],
                            top: '12%',
                            itemWidth: 14,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            }
                        },
                        xAxis: {
                            type: 'category',
                            data: SHCharts5Cdata,
                            axisLabel: {
                                color: '#fff',
                                margin: 25,
                                interval: 0,
                                formatter: function (value, index) {
                                    if (index % 2 != 0) {
                                        return '\n\n' + value;
                                    }
                                    else {
                                        return value
                                    }
                                }
                            }
                        },
                        yAxis: [{
                            type: 'value',
                            splitLine: {
                                lineStyle: {
                                    color: '#365E69',
                                    type: 'dashed'
                                }
                            },
                        }, {
                            type: 'value',
                            splitLine: {
                                lineStyle: {
                                    color: '#365E69',
                                    type: 'dashed'
                                }
                            },
                        }],
                        series: [{
                            name: '人口',
                            data: SHCharts5data1,
                            type: 'bar',
                            barWidth: '50%',
                            itemStyle: {
                                color: '#5bb8ff'
                            },
                        }, {
                            name: '密度 （人/平方公里）',
                            data: SHCharts5data2,
                            type: 'line',
                            yAxisIndex: 1,
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

                    $('#SHCharts5').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '25%',
                            height: '95%',
                            right: '0%'
                        })
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var SHCharts5CdataFull = [];
                        var SHCharts5data1Full = [];
                        var SHCharts5data2Full = [];
                        var color = ['rgb(180,255,205)', 'rgb(72,214,93)', 'rgb(0,181,26)', 'rgb(0,131,18)', 'rgb(0,89,13)']
                        var step1 = Number(SHCharts5data[0].Population) / 5;
                        var step2 = Number(SHCharts5data[0].Density) / 5;
                        var SHCharts5colorMapData1 = [];
                        var SHCharts5colorMapData2 = [];
                        for (var i in SHCharts5data) {
                            var d = SHCharts5data[i];
                            SHCharts5CdataFull.push(d.MC.substring(0, 2));
                            SHCharts5data1Full.push(Number(d.Population).toFixed(0));
                            SHCharts5data2Full.push(Number(d.Density));
                            SHCharts5colorMapData1.push({
                                MC:d.MC,
                                Sum:d.Population
                            });
                            SHCharts5colorMapData2.push({
                                MC:d.MC,
                                Sum:d.Density
                            })
                        }
                        var option5Full = {
                            title: {
                                text: '常 住 人 口',
                                left: 'center',
                                top: '3%',
                                textStyle: {
                                    color: 'rgb(122,225,255)',
                                    fontWeight: '800',
                                    fontSize: $('body').height() * 0.02,
                                    width: '100%',
                                    fontFamilt: 'Microsoft YaHei',
                                }
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: "{b} : {c}",
                                textStyle: {
                                    fontSize: $('body').height() * 0.01,
                                }
                            },
                            grid: {
                                top: '15%',
                                bottom: '5%',
                                left: '25%'
                            },
                            legend: {
                                data: ['人口', '密度 （人/平方公里）'],
                                top: '8%',
                                itemWidth: $('body').height() * 0.015,
                                itemHeight: $('body').height() * 0.01,
                                textStyle: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.015,
                                }
                            },
                            yAxis: {
                                type: 'category',
                                data: SHCharts5CdataFull,
                                axisLabel: {
                                    color: '#fff',
                                    margin: 25,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.015
                                }
                            },
                            xAxis: [{
                                type: 'value',
                                splitLine: {
                                    lineStyle: {
                                        color: '#365E69',
                                        type: 'dashed'
                                    }
                                },
                            }, {
                                type: 'value',
                                splitLine: {
                                    lineStyle: {
                                        color: '#365E69',
                                        type: 'dashed'
                                    }
                                },
                            }],
                            series: [{
                                name: '人口',
                                data: SHCharts5data1Full,
                                type: 'bar',
                                barWidth: '40%',
                                itemStyle: {
                                    color: '#5bb8ff'
                                },
                            }, {
                                name: '密度 （人/平方公里）',
                                data: SHCharts5data2Full,
                                type: 'line',
                                xAxisIndex: 1,
                                symbol: 'circle',
                                lineStyle: {
                                    color: '#ffd74e'
                                },
                                itemStyle: {
                                    color: '#ffd74e'
                                },
                            }]
                        };
                        ec.setOption(option5Full);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#SHCharts5').empty();
                }

                if (response[5].result == 'ok') {
                    var SHCharts6data = JSON.parse(response[5].data);
                    $('#SHCharts6').empty();
                    $('#SHCharts6').append("<div class='chartsTitle'>交 通 便 利 TOP5</div>")
                    for (var i = 0; i < 5; i++) {
                        var f = SHCharts6data[i];
                        if (f) {
                            var c = 'third';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            }
                            var html = "<div class='SHCharts6Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + f.MC + "</div>";
                            var num = Math.round(f.TrafficIndex)
                            var half = Math.round(f.TrafficIndex) - f.TrafficIndex;
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
                            $('#SHCharts6').append(html)
                        }
                    }
                    $('.SHCharts6Item').css('line-height', $('.SHCharts6Item').height() + 'px');

                    $('#SHCharts6').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '25%',
                            height: '95%',
                            right: '0%'
                        })
                        $('#fullScreenCharts').append("<div class='chartsTitle'>交 通 便 利 指 数</div>");
                        var color = ['rgb(255,215,180)', 'rgb(255,183,97)', 'rgb(246,137,0)', 'rgb(223,84,0)', 'rgb(154,47,0)']
                        color= color.reverse();
                        var step = Number(SHCharts6data[0].TrafficIndex) / 5;
                        var SHCharts6colorMapData = [];
                        for (var i = 0; i < SHCharts6data.length; i++) {
                            SHCharts6colorMapData.push({
                                MC:SHCharts6data[i].MC,
                                Sum:Number(SHCharts6data[i].TrafficIndex)
                            })
                            var f = SHCharts6data[i];
                            var c = 'rest';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            } else if (i == '2') {
                                c = 'third'
                            }
                            var html = "<div class='SHCharts6Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + f.MC + "</div>";
                            var num = Math.round(f.TrafficIndex)
                            var half = Math.round(f.TrafficIndex) - f.TrafficIndex;
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
                            $('#fullScreenCharts').append(html)
                        }

                        $('#fullScreenCharts .SHCharts2Item').css('line-height', $('.SHCharts2Item').height() + 'px');
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();

                        })
                    })
                } else {
                    $('#SHCharts6').empty();
                }

                return

                // $('#ToolBar').empty();
                // $('#ToolBar').show();
                // $('#ToolBar').append('<select id="year"></select>');
                // $('#ToolBar').append('<select id="month"></select>');
                for (var i in response.year) {
                    $('#ToolBar #year').append('<option value="' + response.year[i].year + '">' + response.year[i].year + '年</option>')
                }
                for (var i in response.month) {
                    $('#ToolBar #month').append('<option value="' + response.month[i].month + '">' + response.month[i].month + '月</option>')
                }
            }
        })
    }

    function hide() {
        $(".SHCharts").hide();
    }

    return {
        create: create,
        hide: hide
    }
}();
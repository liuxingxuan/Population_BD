var BDzoomToDistrict = true;
var BDCharts = function () {
    function chartsBD(name) {
        highlightDistrictEnable = false;
        for (var i in BDArea[name]) {
            viewer.entities.getById(BDArea[name][i]).show = true;
        }
        var hasTs = false;
        for (var i in BDTilesetList) {
            var bd = BDTilesetList[i]
            if (i == name) {
                $('#mapContainer').fadeIn();
                layerbaimo.visible = false;
                require([
                    "esri/layers/SceneLayer",
                    "esri/geometry/Polygon",
                ], function (SceneLayer, Polygon) {
                    for (var x in BDTilesetList[i].url) {
                        var l = new SceneLayer({
                            layerType: 'bd',
                            url: BDTilesetList[i].url[x],
                            visible: true,
                            opacity: 1
                        });
                        bdLayers.push(l)
                        map.add(l)
                    }
                    var polygon = new Polygon({
                        rings: [ // first ring
                            [bd.extent[0], bd.extent[1]],
                            [bd.extent[2], bd.extent[1]],
                            [bd.extent[2], bd.extent[3]],
                            [bd.extent[0], bd.extent[3]],
                            [bd.extent[0], bd.extent[1]]
                        ],
                        spatialReference: {
                            wkid: 4326
                        }
                    });
                    view.goTo({
                        tilt: 60.78742411941835,
                        target: polygon,
                        options: {
                            duration: 4000
                        }
                    })
                    hasTs = true;
                })
            }
        }
        if (!hasTs) {
            $('#mapContainer').fadeIn();
            layerbaimo.visible = true;
            var poly = BDAreaPolygon[name];
            if (poly) {
                require([
                    "esri/Graphic",
                    "esri/layers/GraphicsLayer",
                    "esri/geometry/Polygon",
                ], function (Graphic, GraphicsLayer, Polygon) {
                    if(poly.geometry.type == 'Polygon'){
                        var geometry = new Polygon({
                            rings: poly.geometry.coordinates,
                        });
                    } else {
                        var coor = poly.geometry.coordinates;
                        var rings = []
                        for(var i in coor){
                            var c = coor[i][0]
                            rings.push(c)
                        }
                        var geometry = new Polygon({
                            rings: rings
                        });
                    }
                    var symbol = {
                        type: 'simple-fill',
                        color: [255, 215, 0, 0.3],
                        style: 'solid',
                        outline: {
                            color: [255, 215, 0],
                            width: 2
                        }
                    }
                    var g = new Graphic({
                        id: 'bdarea',
                        geometry: geometry,
                        symbol: symbol,
                    })
                    view.graphics.add(g)
                    view.goTo({
                        tilt: 60.78742411941835,
                        target: geometry,
                        options: {
                            duration: 4000
                        }
                    })
                })
            }
        }
        for (var i in BDCenter) {
            var bd = BDCenter[i];
            if (bd.properties.Name == name) {
                $('#ToolBar #district').val(bd.properties.District);
                BDzoomToDistrict = false
                $('#ToolBar #district').trigger('change');
                setTimeout(function () {
                    $('#ToolBar #bd').val(name);
                    BDzoomToDistrict = true;
                }, 2500)
            }
        }
        if (viewer.entities.getById(clickBDid)) {
            var e = viewer.entities.getById(clickBDid);
            //console.log(e);
            //viewer.entities.getById(clickBDid).label.show = true;
            viewer.entities.getById(clickBDid).billboard.image = "img/shangquan_big_d.png"
            viewer.entities.getById(clickBDid).label.pixelOffset = new Cesium.Cartesian2(0, 30);
        }
        highlightBDEnbale = false;
        $('.BDCharts').show();
        $('.BDCharts').off('click');
        $('.BDChartsBack').width($('#BDCharts1').width() + 5);
        $('#BDCharts7Back').width($('body').width() - ($('#BDCharts1').width() + 5) * 2);
        $('#BDCharts7Back').height($('#BDCharts7').height() + 20);
        $('#BDCharts7Back').css('left', $('#BDCharts1').width() + 5);
        var year = $('#ToolBar #year').val();
        var month = $('#ToolBar #month').val();
        var time = year + '/' + month + '/1';
        var url = serviceHost + "GetBDChartsData?name=" + name + "&time=" + time;
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = eval('(' + response + ')');
                //console.log(response)
                if (response[0].result == 'ok') {
                    var data = JSON.parse(response[0].data)
                    $('#BDCharts1').empty();
                    $('#BDCharts1').append("<div class='chartsTitle'>主 要 商 业 体</div>")
                    $('#BDCharts1').append("<div class='BDCharts1ItemContainer'></div>")
                    $('.BDCharts1ItemContainer').css({
                        height: $('#BDCharts1').height() - $('#BDCharts1 .chartsTitle').outerHeight() - 10
                    })
                    var zysyt = data.Area.split('/')
                    for (var i in zysyt) {
                        if (zysyt[i] !== '') {
                            $('#BDCharts1 .BDCharts1ItemContainer').append("<div class='BDCharts1Item'>" + zysyt[i] + "</div>")
                        }
                    }

                    $('#BDCharts4').empty();
                    $('#BDCharts4').append("<div class='BDCharts4Item'><div class='BDCharts4ItemTitle'>全市排名</div><div class='BDCharts4ItemContent'>" + data.CityRank + "</div></div>")
                    $('#BDCharts4').append("<div class='BDCharts4Item'><div class='BDCharts4ItemTitle'>区内排名</div><div class='BDCharts4ItemContent'>" + data.DistrictRank + "</div></div>")
                    $('#BDCharts4').append("<div class='BDCharts4Item'><div class='BDCharts4ItemTitle'>客流指数</div><div class='BDCharts4ItemContent'>" + "<div id='BDFlow'>" + "</div></div>")
                    var num = Math.round(data.Flow / 10);
                    if (num == 0) {
                        $('#BDFlow').append('<div class="zero"></div>');
                        for (var x = 0; x < 9; x++) {
                            $('#BDFlow').append('<div class="n"></div>');
                        }
                    } else {
                        for (var x = 0; x < num; x++) {
                            $('#BDFlow').append('<div class="d"></div>');
                        }
                        for (var x = 0; x < 10 - num; x++) {
                            $('#BDFlow').append('<div class="n"></div>');
                        }
                    }
                    $('#BDCharts4').append("<div class='BDCharts4Item'><div class='BDCharts4ItemTitle'>交通便利指数</div><div class='BDCharts4ItemContent'><div id='BDTraffic'></div></div>")
                    var num = Math.round(data.Traffic)
                    var half = Math.round(data.Traffic) - data.Traffic;
                    if (half != 0) {
                        half = 1;
                        num -= 1;
                    }
                    for (var x = 0; x < num; x++) {
                        $('#BDTraffic').append('<div class="d"></div>');
                    }
                    if (half == 1) {
                        $('#BDTraffic').append('<div class="dhalf"></div>');
                    }
                    for (var x = 0; x < (5 - num - half); x++) {
                        $('#BDTraffic').append('<div class="n"></div>');
                    }

                    $('.BDCharts4ItemTitle').css('line-height', $('.BDCharts4ItemTitle').height() + 'px');
                    $('.BDCharts4ItemContent').css('line-height', $('.BDCharts4ItemContent').height() + 'px');
                    $('#BDFlow,#BDTraffic').css({
                        top: ($('.BDCharts4ItemContent').height() - 35) / 2,
                        left: ($('.BDCharts4ItemContent').width() * 0.80 - 100) / 2
                    })
                } else {
                    $('#BDCharts1').empty();
                    $('#BDCharts4').empty();
                }

                if (response[6].result == 'ok') {
                    var data = JSON.parse(response[6].data)
                    $('#BDCharts1').empty();
                    $('#BDCharts1').append("<div class='chartsTitle'>主 要 商 业 体</div>")
                    $('#BDCharts1').append("<div class='BDCharts1ItemContainer'></div>")
                    $('.BDCharts1ItemContainer').css({
                        height: $('#BDCharts1').height() - $('#BDCharts1 .chartsTitle').outerHeight() - 10
                    })
                    var zysyt = data.split('/')
                    for (var i in zysyt) {
                        if (zysyt[i] !== '') {
                            $('#BDCharts1 .BDCharts1ItemContainer').append("<div class='BDCharts1Item'>" + zysyt[i] + "</div>")
                        }
                    }
                } else {
                    $('#BDCharts1').empty();
                }

                if (response[1].result == 'ok') {
                    var gxData = JSON.parse(response[1].data);
                    var BDCharts2XAxis = []
                    var BDCharts2MaxValue = 0;
                    for (var i = 0; i < 5; i++) {
                        if (gxData[i]) {
                            BDCharts2XAxis.push(gxData[i].Name);
                            if (gxData[i].Percent > BDCharts2MaxValue) {
                                BDCharts2MaxValue = gxData[i].Percent;
                            }
                        }
                    }
                    BDCharts2MaxValue = Math.round(BDCharts2MaxValue);
                    BDCharts2MaxValue = (BDCharts2MaxValue - BDCharts2MaxValue % 10) + 10
                    var BDCharts2 = echarts.init(document.getElementById('BDCharts2'))
                    var BDCharts2Image = []
                    var BDCharts2Data = [];
                    var BDCHarts2DataBack = [];
                    var BDCharts2Color = ['rgb(240,89,89)', 'rgb(240,135,89', 'rgb(245,199,76)', 'rgb(80,199,243)', 'rgb(80,199,243)'];
                    for (var i = 0; i < 5; i++) {
                        if (gxData[i]) {
                            BDCHarts2DataBack.push({
                                value: BDCharts2MaxValue,
                                symbol: 'image://img/柱形图背景.png'
                            })
                            var top5Enough = gxData.length > 4 ? 5 : gxData.length;
                            BDCharts2Image.push({
                                type: 'image',
                                left: $('#BDCharts2').width() * 0.1 + i * ($('#BDCharts2').width() * 0.8 / top5Enough) + ($('#BDCharts2').width() * 0.8 / top5Enough - 14) / 2,
                                top: 22 + (100 - 22 - 30) * (1 - gxData[i].Percent / BDCharts2MaxValue) + "%",
                                z: 5,
                                style: {
                                    image: 'img/柱形图圆' + Number(i + 1) + '.png'
                                }
                            })
                            BDCharts2Data.push({
                                value: Number(gxData[i]['Percent']).toFixed(2),
                                itemStyle: {
                                    color: BDCharts2Color[i]
                                }
                            })
                        }
                    }
                    var option2 = {
                        title: {
                            text: '人 口 共 享 客 流 占 比 TOP5',
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
                        grid: {
                            top: '22%',
                            bottom: '30%',
                            left: '10%'
                        },
                        xAxis: {
                            type: 'category',
                            data: BDCharts2XAxis,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                interval: 0,
                                color: '#fff',
                                formatter: function (value, index) {
                                    var text = ""
                                    if (index % 2 != 0) {
                                        text += '\n\n';
                                    }
                                    for (var i in value) {
                                        if (i % 5 == 0 && i !== '0') {
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
                            show: false
                        },
                        graphic: BDCharts2Image,
                        series: [{
                                name: 'value',
                                type: 'bar',
                                barWidth: 14,
                                z: 3,
                                itemStyle: {
                                    barBorderRadius: 5,
                                },
                                data: BDCharts2Data,
                            },
                            {
                                type: 'pictorialBar',
                                barGap: '-100%',
                                barWidth: 14,
                                label: {
                                    show: true,
                                    position: 'top',
                                    color: '#fff',
                                    formatter: function (para) {
                                        if (gxData[para.dataIndex]) {
                                            return gxData[para.dataIndex]['Percent'].toFixed(1) + '%'
                                        } else {
                                            return ''
                                        }
                                    }
                                },
                                data: BDCHarts2DataBack
                            },
                        ]
                    };
                    BDCharts2.setOption(option2);
                    $('#BDCharts2').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var BDCharts1ShadowdataFull = [];
                        var BDCharts2XAxisFull = []
                        var BDCharts2MaxValueFull = 0;
                        var BDCharts2ColorFull = [];
                        for (var i = 0; i < gxData.length; i++) {
                            BDCharts2XAxisFull.push(gxData[i].Name);
                            if (gxData[i].Percent > BDCharts2MaxValueFull) {
                                BDCharts2MaxValueFull = gxData[i].Percent;
                            }
                            if (i == 0) {
                                BDCharts2ColorFull.push('rgb(240,89,89)')
                            } else if (i == 1) {
                                BDCharts2ColorFull.push('rgb(240,135,89')
                            } else if (i == 2) {
                                BDCharts2ColorFull.push('rgb(245,199,76)')
                            } else {
                                BDCharts2ColorFull.push('rgb(80,199,243)')
                            }
                        }
                        BDCharts2MaxValueFull = Math.round(BDCharts2MaxValueFull);
                        BDCharts2MaxValueFull = (BDCharts2MaxValueFull - BDCharts2MaxValueFull % 10) + 10
                        var BDCharts2DataFull = [];
                        for (var i = 0; i < gxData.length; i++) {
                            BDCharts2DataFull.push({
                                value: Number(gxData[i]['Percent']).toFixed(2),
                                itemStyle: {
                                    color: BDCharts2ColorFull[i]
                                }
                            })
                            BDCharts1ShadowdataFull.push({
                                value: BDCharts2MaxValueFull,
                            })
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '人 口 共 享 客 流 占 比',
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
                            grid: {
                                top: '20%',
                                bottom: '20%',
                                left: '10%'
                            },
                            xAxis: {
                                type: 'category',
                                data: BDCharts2XAxisFull,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    interval: 0,
                                    margin: $('body').height() * 0.04,
                                    rotate: 30,
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02,
                                }

                            },
                            yAxis: {
                                type: 'value',
                                show: false
                            },
                            series: [{
                                    name: 'value',
                                    type: 'bar',
                                    barWidth: '50%',
                                    z: 3,
                                    itemStyle: {
                                        barBorderRadius: 5,
                                    },
                                    data: BDCharts2DataFull,
                                },
                                {
                                    type: 'bar',
                                    barGap: '-100%',
                                    barWidth: '50%',
                                    label: {
                                        show: true,
                                        position: 'top',
                                        distance: $('body').height() * 0.04,
                                        color: '#fff',
                                        formatter: function (para) {
                                            return gxData[para.dataIndex]['Percent'].toFixed(1) + '%'
                                        },
                                        fontSize: $('body').height() * 0.025,
                                    },
                                    data: BDCharts1ShadowdataFull
                                },
                            ]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#BDCharts2').empty();
                }

                if (response[2].result == 'ok') {
                    var BDCharts3data = JSON.parse(response[2].data);
                    var BDCharts3Data = [];
                    var BDCharts3LegendData = [];
                    for (var i in BDCharts3data) {
                        BDCharts3Data.push({
                            name: BDCharts3data[i].Industry,
                            value: Number(BDCharts3data[i].TradeSum).toFixed(2)
                        })
                        BDCharts3LegendData.push(BDCharts3data[i].Industry)
                    }
                    BDCharts3LegendData.sort(function (a, b) {
                        return a.length - b.length
                    })
                    var BDCharts3 = echarts.init(document.getElementById('BDCharts3'))
                    var option3 = {
                        title: {
                            text: '各 行 业 交 易 金 额 占 比',
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
                            top: '25%',
                            bottom: '5%',
                            left: '10%'
                        },
                        color: ['rgb(128,232,138)', 'rgb(86,117,238)', 'rgb(255,217,83)', 'rgb(176,214,0)', 'rgb(106,229,255)', 'rgb(228,0,127)', 'rgb(255,126,63)', 'rgb(0,160,233)', 'rgb(231,157,255)', 'rgb(149,149,149)', 'rgb(255,79,195)'],
                        legend: {
                            data: BDCharts3LegendData,
                            orient: 'vertical',
                            top: '20%',
                            left: '5%',
                            width: '40%',
                            itemGap: 15,
                            padding: 2,
                            itemWidth: 8,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            }
                        },
                        series: [{
                            name: '',
                            type: 'pie',
                            radius: '65%',
                            center: ['70%', '60%'],
                            data: BDCharts3Data,
                            labelLine: {
                                show: true,
                                length: 8,
                                length2: 0,
                                lineStyle: {
                                    color: 'rgba(0,0,0,0)'
                                }
                            },
                            label: {
                                show: true,
                                fontWeight: '800',
                                formatter: function (para) {
                                    if (para.percent > 5) {
                                        return para.percent.toFixed(1) + "%"
                                    } else {
                                        return ''
                                    }
                                },

                            }
                        }]
                    }
                    BDCharts3.setOption(option3);
                    $('#BDCharts3').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var BDCharts3DataFull = [];
                        var BDCharts3LegendDataFull = [];
                        for (var i in BDCharts3data) {
                            BDCharts3DataFull.push({
                                name: BDCharts3data[i].Industry,
                                value: Number(BDCharts3data[i].TradeSum).toFixed(2)
                            })
                            BDCharts3LegendDataFull.push(BDCharts3data[i].Industry)
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '各 行 业 交 易 金 额 占 比',
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
                                    fontSize: $('body').height() * 0.03,
                                }
                            },
                            grid: {
                                top: '20%',
                                bottom: '15%',
                                left: '10%'
                            },
                            color: ['rgb(128,232,138)', 'rgb(86,117,238)', 'rgb(255,217,83)', 'rgb(176,214,0)', 'rgb(106,229,255)', 'rgb(228,0,127)', 'rgb(255,126,63)', 'rgb(0,160,233)', 'rgb(231,157,255)', 'rgb(149,149,149)', 'rgb(255,79,195)'],
                            series: [{
                                name: '',
                                type: 'pie',
                                radius: '75%',
                                center: ['50%', '55%'],
                                data: BDCharts3DataFull,
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
                                    },

                                }
                            }]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#BDCharts3').empty();
                }

                if (response[3].result == 'ok') {
                    var BDCharts5data = JSON.parse(response[3].data);
                    $('#BDCharts5').empty();
                    $('#BDCharts5').append("<div class='chartsTitle'>刷 卡 来 源 地 TOP5</div>")
                    for (var i = 0; i < 5; i++) {
                        var c = 'rest';
                        var cc = 'oneString'
                        if (i == '0') {
                            c = 'first'
                        } else if (i == '1') {
                            c = 'second'
                        } else if (i == '2') {
                            c = 'third'
                        }
                        var html = "<div class='BDCharts5Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                        html += "<div class='two'>" + BDCharts5data[i].Source + "</div>";
                        html += "<div class='three' style='width:" + BDCharts5data[i].Sum / 100 * 220 + "px'></div>";
                        $('#BDCharts5').append(html)
                    }
                    $('.BDCharts5Item').css('line-height', $('.BDCharts5Item').height() + 'px');
                    $('#BDCharts5').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        $('#fullScreenCharts').append("<div class='chartsTitle'>刷 卡 来 源 地</div>")
                        for (var i = 0; i < BDCharts5data.length; i++) {
                            var c = 'rest';
                            var cc = 'oneString'
                            if (i == '0') {
                                c = 'first'
                            } else if (i == '1') {
                                c = 'second'
                            } else if (i == '2') {
                                c = 'third'
                            }
                            var html = "<div class='BDCharts5Item'><div class='one'><span class='" + c + " " + cc + "'>" + (Number(i) + 1) + "</span></div>"
                            html += "<div class='two'>" + BDCharts5data[i].Source + "</div>";
                            html += "<div class='three' style='width:" + BDCharts5data[i].Sum / 100 * $('body').height() * 0.03 * 10 + "px'></div>";
                            $('#fullScreenCharts').append(html)
                        }
                        $('#fullScreenCharts .BDCharts5Item div.three').css({
                            height: $('body').height() * 0.03 + 'px',
                            backgroundSize: $('body').height() * 0.03 + 'px ' + $('body').height() * 0.03 + 'px',
                        })
                        $('#fullScreenCharts .BDCharts5Item').css('line-height', $('#fullScreenCharts .BDCharts5Item').height() + 'px');
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#BDCharts5').empty();
                }

                if (response[4].result == 'ok') {
                    var BDCharts6data = JSON.parse(response[4].data);
                    var eCharts6 = echarts.getInstanceByDom(document.getElementById('BDCharts6'))
                    if(!eCharts6){
                        eCharts6 = echarts.init(document.getElementById('BDCharts6'));
                    }
                    var BDCharts6Cdata = [];
                    var BDCharts6Ddata = [];
                    for (var i in BDCharts6data) {
                        var d = BDCharts6data[i];
                        BDCharts6Cdata.push(d.MC.substring(0, 2));
                        BDCharts6Ddata.push(Number(d.Num).toFixed(0));
                    }
                    var option6 = {
                        title: {
                            text: '人 口 客 流 来 源 地',
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
                            bottom: '20%',
                        },
                        xAxis: {
                            type: 'category',
                            data: BDCharts6Cdata,
                            axisLabel: {
                                color: '#fff',
                                margin: 15,
                                interval: 0,
                                formatter: function (value, index) {
                                    if (index % 2 == 0) {
                                        return '\n\n' + value;
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
                            data: BDCharts6Ddata,
                            type: 'bar',
                            barWidth: '50%',
                            itemStyle: {
                                color: '#5bb8ff'
                            },
                        }]
                    };
                    eCharts6.setOption(option6);
                    $('#BDCharts6').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var BDCharts6CdataFull = [];
                        var BDCharts6DataFull = [];
                        for (var i in BDCharts6data) {
                            var d = BDCharts6data[i];
                            BDCharts6CdataFull.push(d.MC.substring(0, 2));
                            BDCharts6DataFull.push(Number(d.Num).toFixed(0));
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '人 口 客 流 来 源 地',
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
                                formatter: "{b} : {c}%",
                                textStyle: {
                                    fontSize: $('body').height() * 0.025
                                }
                            },
                            grid: {
                                top: '20%',
                                bottom: '15%',
                            },
                            xAxis: {
                                type: 'category',
                                data: BDCharts6CdataFull,
                                axisLabel: {
                                    color: '#fff',
                                    margin: $('body').height() * 0.03,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.02
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
                                nameGap: $('body').height() * 0.03,
                                nameTextStyle: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.025
                                },
                                axisLabel: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02
                                }
                            },
                            series: [{
                                name: '人口',
                                data: BDCharts6DataFull,
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
                    })
                } else {
                    echarts.dispose(document.getElementById('BDCharts6'));
                }

                if (response[5].result == 'ok') {
                    var customerProperty = JSON.parse(response[5].data);
                    var BDCharts7 = echarts.init(document.getElementById('BDCharts7'));
                    var BDCharts7Catalogy = [];
                    var BDCharts7Shadow = [];
                    var BDCharts7Data = [];
                    var BDCharts7MaxValue = 100;
                    for (var i in customerProperty) {
                        BDCharts7Catalogy.push(customerProperty[i].Property);
                        BDCharts7Data.push(customerProperty[i].Percent);
                        BDCharts7Shadow.push(BDCharts7MaxValue)
                    }
                    var option7 = {
                        title: {
                            text: '人 口 消 费 人 群 标 签 统 计',
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
                        grid: {
                            top: '25%',
                            left: '5%',
                            right: '5%',
                            bottom: '25%'
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'line',
                            },
                            formatter: function (para) {
                                return customerProperty[para[1].dataIndex].Threshold + "：" + para[1].value + "%"
                            }
                        },
                        xAxis: [{
                            type: 'category',
                            data: BDCharts7Catalogy,
                            axisPointer: {
                                type: 'shadow'
                            },
                            axisLabel: {
                                color: 'rgb(255,255,255)',
                                //color: 'rgb(205,210,215)',
                                interval: 0,
                                rotate: 25,
                                margin: 20,
                                padding: [0, -30]
                            },
                            axisLine: {
                                show: false
                            },
                            splitLine: {
                                show: false
                            }
                        }],
                        yAxis: [{
                            axisTick: {
                                show: false
                            },
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: false,
                            },
                            splitLine: {
                                show: false
                            },
                            max: BDCharts7MaxValue,
                        }],
                        series: [{
                                name: 'shadow',
                                type: 'bar',
                                data: BDCharts7Shadow,
                                itemStyle: {
                                    color: 'rgb(255,255,255,0.1)',
                                    barBorderRadius: 15,
                                },
                                barGap: '-100%',
                                barWidth: '15%',
                                animation: false,
                                label: {
                                    show: true,
                                    position: 'top',
                                    color: '#fff',
                                    formatter: function (para) {
                                        return customerProperty[para.dataIndex]['Percent'].toFixed(1) + '%'
                                    }
                                },
                            },
                            {
                                type: 'bar',
                                data: BDCharts7Data,
                                barWidth: '15%',
                                animation: true,
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(
                                        0, 0, 0, 1,
                                        [{
                                                offset: 1,
                                                color: 'rgb(0,136,218)'
                                            },
                                            {
                                                offset: 0,
                                                color: 'rgb(80,167,227)'
                                            }
                                        ]
                                    ),
                                    barBorderRadius: 15
                                }
                            }
                        ]
                    };
                    BDCharts7.setOption(option7);
                    $('#BDCharts7').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        });
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '人 口 消 费 人 群 标 签 统 计',
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
                            grid: {
                                top: '15%',
                                left: '5%',
                                right: '5%',
                                bottom: '20%'
                            },
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'line',
                                },
                                formatter: function (para) {
                                    return customerProperty[para[1].dataIndex].Threshold + "：" + para[1].value + "%"
                                },
                                textStyle: {
                                    fontSize: $('body').height() * 0.025
                                }
                            },
                            xAxis: [{
                                type: 'category',
                                data: BDCharts7Catalogy,
                                axisPointer: {
                                    type: 'shadow'
                                },
                                axisLabel: {
                                    color: 'rgb(205,210,215)',
                                    interval: 0,
                                    rotate: 15,
                                    margin: $('body').height() * 0.03,
                                    fontSize: $('body').height() * 0.02,
                                    padding: [0, -15]
                                },
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                axisTick: {
                                    show: false
                                },
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false,
                                },
                                splitLine: {
                                    show: false
                                },
                                max: BDCharts7MaxValue,
                            }],
                            series: [{
                                    name: 'shadow',
                                    type: 'bar',
                                    data: BDCharts7Shadow,
                                    itemStyle: {
                                        color: 'rgb(255,255,255,0.1)',
                                        barBorderRadius: 15,
                                    },
                                    barGap: '-100%',
                                    barWidth: '15%',
                                    animation: false,
                                    label: {
                                        show: true,
                                        position: 'top',
                                        color: '#fff',
                                        distance: $('body').height() * 0.03,
                                        fontSize: $('body').height() * 0.02,
                                        formatter: function (para) {
                                            return customerProperty[para.dataIndex]['Percent'].toFixed(1) + '%'
                                        }
                                    },
                                },
                                {
                                    type: 'bar',
                                    data: BDCharts7Data,
                                    barWidth: '15%',
                                    animation: true,
                                    itemStyle: {
                                        color: new echarts.graphic.LinearGradient(
                                            0, 0, 0, 1,
                                            [{
                                                    offset: 1,
                                                    color: 'rgb(0,136,218)'
                                                },
                                                {
                                                    offset: 0,
                                                    color: 'rgb(80,167,227)'
                                                }
                                            ]
                                        ),
                                        barBorderRadius: 15
                                    }
                                }
                            ]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    });
                } else {
                    $('#BDCharts7').empty();
                }
            }
        })
    }

    function chartsBDHide() {
        $('#mapContainer').fadeOut();
        for (var i in bdLayers) {
            var l = bdLayers[i]
            map.remove(l)
        }
        $('.BDCharts').hide();
        if ($('.indexBarItem[value=bd]').hasClass('selected')) {
            highlightBDEnbale = true;
            highlightDistrictEnable = true;
            if (clickBDid !== "") {
                var e = viewer.entities.getById(clickBDid);
                e.label.show = false;
                if (e.BDType == '市级街道') {
                    e.billboard.image = "img/shangquan_big.png"
                    e.label.pixelOffset = new Cesium.Cartesian2(0, 28)
                } else {
                    e.billboard.image = "img/shangquan_small.png"
                    e.label.pixelOffset = new Cesium.Cartesian2(0, 16)
                }
                clickBDid = "";
            }
        }
        for (var i in BDArea) {
            for (var x in BDArea[i]) {
                viewer.entities.getById(BDArea[i][x]).show = false;
            }
        }
    }

    function BDToolBar() {
        $('#ToolBar').show();
        $('#ToolBar #district,#ToolBar #bd').remove();
        $('#ToolBar').append('<select id="district"></select>')
        for (var i in districtPoint.features) {
            var f = districtPoint.features[i];
            if ((sessionStorage['roleDetail'] == f.properties.QX && sessionStorage['role'] == 'district') || (sessionStorage['roleDetail'] == "")) {
                $('#ToolBar #district').append('<option value="' + f.properties.QX + '">' + f.properties.QX + '</option>')
            }
        }
        $('#ToolBar #district').on('change', function () {
            var d = $(this).val();
            for (var i in districtEntity[d]) {
                viewer.entities.getById(districtEntity[d][i]).show = false;
            };
            if (BDzoomToDistrict) {
                for (var i in districtEnveloped.features) {
                    var f = districtEnveloped.features[i];
                    if (f.properties.Name == d) {
                        var e = f.geometry.coordinates[0];
                        viewer.camera.flyTo({
                            destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1] - 0.05, e[1][0], e[2][1] + 0.15),
                            duration: 3,
                        });
                    }
                }
            }
            var dname = $(this).val();
            getBDByDistrict(dname);
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

                getTopBD();

                $('#ToolBar #year,#ToolBar #month').on('change', function () {
                    getTopBD();
                    if (clickBDid !== "") {
                        var e = viewer.entities.getById(clickBDid);
                        chartsBD(e.BDName);
                    }
                })
            }
        })

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
                        $('#indexBar div[value=bd]').click();
                        BDCharts.create(b);
                    })
                }
            })
        }
    }

    return {
        create: chartsBD,
        hide: chartsBDHide,
        toolBar: BDToolBar
    }
}();
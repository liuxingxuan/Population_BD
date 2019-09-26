var BDCompare = function () {
    function BDCompareCreate() {
        if(pkBD[0].BDName == pkBD[1].BDName){
            pkBD = [];
            alert('请选择不同街道！')
            return
        }
        $('#PKBDSelect').hide();
        $('#PKBDSelect .BDItem').removeClass('selected')
        highlightDistrictEnable = false;
        pkEnable = false;
        var name = [];
        var center = [];
        for (var i in pkBD) {
            name.push(pkBD[i].BDName);
            for (var x in BDCenter) {
                var bd = BDCenter[x];
                if (bd.properties.Name == pkBD[i].BDName) {
                    center.push(bd.geometry.coordinates);
                }
            }
            for (var x in BDArea[pkBD[i].BDName]) {
                viewer.entities.getById(BDArea[pkBD[i].BDName][x]).show = true;
            }
        }
        if (center.length !== 0) {
            var west = center[0][0] > center[1][0] ? center[1][0] : center[0][0];
            var east = center[0][0] > center[1][0] ? center[0][0] : center[1][0];
            var north = center[0][1] > center[1][1] ? center[0][1] : center[1][1];
            var sourth = center[0][1] > center[1][1] ? center[1][1] : center[0][1];
            viewer.camera.flyTo({
                destination: Cesium.Rectangle.fromDegrees(Number(west) - 0.005, Number(sourth) - 0.012, Number(east) + 0.005, Number(north) + 0.005),
                duration: 3,
            });
        }

        $('.CompareCharts').show();
        $('.CompareCharts').off('click');
        $('.CompareChartsBack').width($('#CompareCharts1').width() + 5);
        $('#CompareCharts7Back').width($('body').width() - ($('#CompareCharts1').width() + 5) * 2);
        $('#CompareCharts7Back').height($('#CompareCharts7').height() + 20);
        $('#CompareCharts7Back').css('left', $('#CompareCharts1').width() + 5)
        var url = serviceHost + "GetBDCompareData?time=2019-06-01&name1=" + name[0] + "&name2=" + name[1]
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                response = eval('(' + response + ')');
                var table0 = response[0];
                var table1 = eval('(' + response[1] + ')');
                var table2 = eval('(' + response[2] + ')');
                // console.log(table0)
                // console.log(table1)
                // console.log(table2)

                //销售额
                if (table0.result == 'ok') {
                    var data = JSON.parse(table0.data)
                    $('#CompareCharts1').empty();
                    $('#CompareCharts1').append('<div class="chartsTitle">销 售 额 比 较</div>')
                    $('#CompareCharts1').append('<div class="CompareCharts1Item"><div class="CompareCharts1ItemTitle">' + data[0].Name + '：</div><div class="CompareCharts1ItemBar"></div><div class="CompareCharts1ItemLabel">' + data[0].TradeSum.toFixed(0) + '</div></div>')
                    $('#CompareCharts1').append('<div class="CompareCharts1Item"><div class="CompareCharts1ItemTitle">' + data[1].Name + '：</div><div class="CompareCharts1ItemBar"></div><div class="CompareCharts1ItemLabel">' + data[1].TradeSum.toFixed(0) + '</div></div>')
                    $('.CompareCharts1ItemBar').each(function () {
                        $(this).css('width', Number($(this).next().text()) * 0.7 + '%')
                    })
                } else {
                    $('#CompareCharts1').empty();
                }

                //行业比较
                if (table1[2].result == 'ok' && table2[2].result == 'ok') {
                    var BDCompare2data1 = JSON.parse(table1[2].data);
                    var BDCompare2data2 = JSON.parse(table2[2].data);
                    var BDCompare2Data = [];
                    var BDCompare2Cdata = []
                    for (var i in BDCompare2data1) {
                        var ind = BDCompare2data1[i];
                        BDCompare2Data.push({
                            name: ind.Industry,
                            type: 'bar',
                            stack: '总量',
                            data: [ind.TradeSum.toFixed(2)],
                            barWidth: 20
                        })
                        BDCompare2Cdata.push(ind.Industry)
                    }
                    for (var i in BDCompare2data2) {
                        var ind = BDCompare2data2[i];
                        var share = false;
                        for (var x in BDCompare2Data) {
                            if (BDCompare2Data[x].name == ind.Industry) {
                                BDCompare2Data[x].data.push(ind.TradeSum.toFixed(2));
                                share = true;
                            }
                        }
                        if (!share) {
                            BDCompare2Cdata.push(ind.Industry)
                            BDCompare2Data.push({
                                name: ind.Industry,
                                type: 'bar',
                                stack: '总量',
                                data: [0, ind.TradeSum.toFixed(2)],
                                barWidth: 20
                            })
                        }
                    }
                    var eCharts2 = echarts.init(document.getElementById('CompareCharts2'));
                    var option2 = {
                        title: {
                            text: '行 业 比 较',
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
                            axisPointer: {
                                type: 'shadow'
                            },
                            formatter: function (para) {
                                var seriesName = para.seriesName;
                                var text = seriesName + '<br>';
                                for (var i in BDCompare2data1) {
                                    var ind = BDCompare2data1[i];
                                    if (seriesName == ind.Industry) {
                                        text += name[0] + '：' + ind.TradeSum.toFixed(2) + '%<br>'
                                    }
                                }
                                for (var i in BDCompare2data2) {
                                    var ind = BDCompare2data2[i];
                                    if (seriesName == ind.Industry) {
                                        text += name[1] + '：' + ind.TradeSum.toFixed(2) + '%'
                                    }
                                }
                                return text
                            }
                        },
                        grid: {
                            top: '40%',
                            bottom: '15%',
                            left: '25%',
                        },
                        xAxis: {
                            type: 'value',
                            max: 100,
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
                            data: name,
                            inverse: true,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                color: '#fff',
                                margin: 25,
                                interval: 0,
                                formatter: function (value) {
                                    var text = "";
                                    for (var i in value) {
                                        if (i % 6 == 0 && i !== '0') {
                                            text += '\n' + value[i]
                                        } else {
                                            text += value[i]
                                        }
                                    }
                                    return text
                                }
                            }
                        },
                        color: ['#8378EA', '#D3BCEA', '#FB7293', '#FF9F7F', '#FFDB5C', '#9FE6B8', '#32C5FD', '#37A2DA', '#FF944D', 'rgb(203,236,88)', '#CBEC58', '#D565F4', '#5CFDFF', '#1DE6A6'],
                        legend: {
                            data: BDCompare2Cdata.splice(0, 10),
                            top: '15%',
                            itemWidth: 14,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            }
                        },
                        series: BDCompare2Data
                    }
                    eCharts2.setOption(option2);
                    var BDCompare2DataFull = [];
                    var BDCompare2CdataFull = []
                    for (var i in BDCompare2data1) {
                        var ind = BDCompare2data1[i];
                        BDCompare2DataFull.push({
                            name: ind.Industry,
                            type: 'bar',
                            stack: '总量',
                            data: [ind.TradeSum.toFixed(2)],
                            barWidth: '30%'
                        })
                        BDCompare2CdataFull.push(ind.Industry)
                    }
                    for (var i in BDCompare2data2) {
                        var ind = BDCompare2data2[i];
                        var share = false;
                        for (var x in BDCompare2DataFull) {
                            if (BDCompare2DataFull[x].name == ind.Industry) {
                                BDCompare2DataFull[x].data.push(ind.TradeSum.toFixed(2));
                                share = true;
                            }
                        }
                        if (!share) {
                            BDCompare2CdataFull.push(ind.Industry)
                            BDCompare2DataFull.push({
                                name: ind.Industry,
                                type: 'bar',
                                stack: '总量',
                                data: [0, ind.TradeSum.toFixed(2)],
                                barWidth: 20
                            })
                        }
                    }
                    $('#CompareCharts2').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '行 业 比 较',
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
                                axisPointer: {
                                    type: 'shadow'
                                },
                                formatter: function (para) {
                                    var seriesName = para.seriesName;
                                    var text = seriesName + '<br>';
                                    for (var i in BDCompare2data1) {
                                        var ind = BDCompare2data1[i];
                                        if (seriesName == ind.Industry) {
                                            text += name[0] + '：' + ind.TradeSum.toFixed(2) + '%<br>'
                                        }
                                    }
                                    for (var i in BDCompare2data2) {
                                        var ind = BDCompare2data2[i];
                                        if (seriesName == ind.Industry) {
                                            text += name[1] + '：' + ind.TradeSum.toFixed(2) + '%'
                                        }
                                    }
                                    return text
                                }
                            },
                            grid: {
                                top: '20%',
                                bottom: '15%',
                                left: '15%',
                            },
                            xAxis: {
                                type: 'value',
                                max: 100,
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
                                data: name,
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    color: '#fff',
                                    margin: 25,
                                    interval: 0,
                                    fontSize: $('body').height() * 0.02
                                }
                            },
                            color: ['#8378EA', '#D3BCEA', '#FB7293', '#FF9F7F', '#FFDB5C', '#9FE6B8', '#32C5FD', '#37A2DA', '#FF944D', 'rgb(203,236,88)', '#CBEC58', '#D565F4', '#5CFDFF', '#1DE6A6'],
                            legend: {
                                data: BDCompare2CdataFull,
                                top: '15%',
                                width: '80%',
                                itemWidth: $('body').height() * 0.03,
                                itemHeight: $('body').height() * 0.015,
                                textStyle: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02,
                                }
                            },
                            series: BDCompare2DataFull
                        }
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#CompareCharts2').empty();
                }

                //客单价
                if (table0.result == 'ok') {
                    var data = JSON.parse(table0.data);
                    $('#CompareCharts3').empty();
                    $('#CompareCharts3').append('<div class="chartsTitle">客 单 价 比 较</div>')
                    $('#CompareCharts3').append('<div class="CompareCharts3Item"><div class="CompareCharts3ItemTitle">' + data[0].Name + '</div><div class="CompareCharts3ItemContent" value="' + data[0].TradeAverage + '"></div></div>')
                    $('#CompareCharts3').append('<div class="CompareCharts3Item"><div class="CompareCharts3ItemTitle">' + data[1].Name + '</div><div class="CompareCharts3ItemContent" value="' + data[1].TradeAverage + '"></div></div>')
                    $('.CompareCharts3ItemTitle').css('line-height', $('.CompareCharts3ItemTitle').height() + 'px')
                    $('.CompareCharts3ItemContent').each(function () {
                        var v = Number($(this).attr('value')).toFixed(0);
                        for (var i in v) {
                            $(this).append('<div class="CompareCharts3ItemContentNum">' + v[i] + '</div>');
                        }
                        $(this).append('<div class="CompareCharts3ItemContentUnit">元</div>');
                        $(this).find('.CompareCharts3ItemContentNum').css('margin-right', ($(this).width() * 0.2 - $('.CompareCharts3ItemContentNum').width() * (v.length - 1)) / (v.length - 1))
                    })
                } else {
                    $('#CompareCharts3').empty();
                }

                //客流，交通指数
                if (table1[0].result == 'ok' && table2[0].result == 'ok') {
                    var data1 = JSON.parse(table1[0].data);
                    var data2 = JSON.parse(table2[0].data);
                    $('#CompareCharts4').empty();
                    $('#CompareCharts4').append('<div class="chartsTitle">客 流 交 通 比 较</div>')
                    $('#CompareCharts4').append('<div class="CompareCharts4Text title one"></div>')
                    $('#CompareCharts4').append('<div class="CompareCharts4Text title two">' + data1.Name + '</div>')
                    $('#CompareCharts4').append('<div class="CompareCharts4Text title two">' + data2.Name + '</div>')
                    $('#CompareCharts4').append('<div class="CompareCharts4Text content one">客流指数</div>')
                    $('#CompareCharts4').append('<div id="flow1" class="CompareCharts4Text content two"></div>')
                    $('#CompareCharts4').append('<div id="flow2" class="CompareCharts4Text content two"></div>')
                    $('#CompareCharts4').append('<div class="CompareCharts4Text content one">交通便利指数</div>')
                    $('#CompareCharts4').append('<div id="traffic1" class="CompareCharts4Text content two"></div>')
                    $('#CompareCharts4').append('<div id="traffic2" class="CompareCharts4Text content two"></div>')

                    //客流
                    var num1 = Math.round(data1.Flow / 10);
                    var html1 = ""
                    if(num1 == 0){
                        html1 += "<div class='three zero'></div>";
                        for (var x = 0; x < 9; x++) {
                            html1 += "<div class='three n'></div>";
                        }
                    } else {
                        for (var x = 0; x < num1; x++) {
                            html1 += "<div class='three d'></div>";
                        }
                        for (var x = 0; x < (10 - num1); x++) {
                            html1 += "<div class='three n'></div>";
                        }
                    }
                    $('#CompareCharts4 #flow1').append(html1);
                    var num2 = Math.round(data2.Flow / 10);
                    var html2 = ""
                    if (num2 == 0) {
                        html2 += "<div class='three zero'></div>";
                        for (var x = 0; x < 9; x++) {
                            html2 += "<div class='three n'></div>";
                        }
                    } else {
                        for (var x = 0; x < num2; x++) {
                            html2 += "<div class='three d'></div>";
                        }
                        for (var x = 0; x < (10 - num2); x++) {
                            html2 += "<div class='three n'></div>";
                        }
                    }
                    $('#CompareCharts4 #flow2').append(html2);

                    //交通
                    var tar1 = Math.round(data1.Traffic)
                    var half1 = Math.round(data1.Traffic) - data1.Traffic;
                    if (half1 != 0) {
                        half1 = 1;
                        tar1 -= 1;
                    }
                    var html3 = ""
                    for (var x = 0; x < tar1; x++) {
                        html3 += "<div class='threeT d'></div>";
                    }
                    if (half1 == 1) {
                        html3 += "<div class='threeT dhalf'></div>";
                    }
                    for (var x = 0; x < (5 - tar1 - half1); x++) {
                        html3 += "<div class='threeT n'></div>";
                    }
                    $('#CompareCharts4 #traffic1').append(html3);
                    var tar2 = Math.round(data2.Traffic)
                    var half2 = Math.round(data2.Traffic) - data2.Traffic;
                    if (half2 != 0) {
                        half2 = 1;
                        tar2 -= 1;
                    }
                    var html4 = ""
                    for (var x = 0; x < tar2; x++) {
                        html4 += "<div class='threeT d'></div>";
                    }
                    if (half1 == 1) {
                        html4 += "<div class='threeT dhalf'></div>";
                    }
                    for (var x = 0; x < (5 - tar2 - half2); x++) {
                        html4 += "<div class='threeT n'></div>";
                    }
                    $('#CompareCharts4 #traffic2').append(html4);

                    $('.CompareCharts4Text').css('line-height', $('.CompareCharts4Text').height() + 'px');
                } else {
                    $('#CompareCharts4').empty();
                }

                //刷卡来源地
                if (table1[3].result == 'ok' && table2[3].result == 'ok') {
                    var BDCOmpare5data1 = JSON.parse(table1[3].data);
                    var BDCOmpare5data2 = JSON.parse(table2[3].data);
                    var CompareCharts5data1 = [];
                    var CompareCharts5data2 = [];
                    var CompateCharts5Cdata1 = [];
                    var CompateCharts5Cdata2 = [];
                    for (var i = 0; i < 5; i++) {
                        CompateCharts5Cdata1.push(BDCOmpare5data1[i].Source);
                        CompateCharts5Cdata2.push(BDCOmpare5data2[i].Source);
                        CompareCharts5data1.push({
                            name: BDCOmpare5data1[i].Source,
                            value: Number(BDCOmpare5data1[i].Sum).toFixed(2)
                        });
                        CompareCharts5data2.push({
                            name: BDCOmpare5data2[i].Source,
                            value: Number(BDCOmpare5data2[i].Sum).toFixed(2)
                        });
                    }
                    var eCharts5Text1 = '';
                    var eCharts5Text2 = '';
                    var eCharts5Text1Line = 0;
                    var eCharts5Text2Line = 0;
                    for (var i in name[0]) {
                        if (i % 6 == 0 && i !== '0') {
                            eCharts5Text1 += '\n' + name[0][i];
                            eCharts5Text1Line++;
                        } else {
                            eCharts5Text1 += name[0][i]
                        }
                    }
                    for (var i in name[1]) {
                        if (i % 6 == 0 && i !== '0') {
                            eCharts5Text2 += '\n' + name[1][i];
                            eCharts5Text2Line++;
                        } else {
                            eCharts5Text2 += name[1][i]
                        }
                    }
                    var length1 = eCharts5Text1.length > 6 ? 6 : eCharts5Text1.length
                    var length2 = eCharts5Text2.length > 6 ? 6 : eCharts5Text2.length
                    var eCharts5 = echarts.init(document.getElementById('CompareCharts5'))
                    var option5 = {
                        title: {
                            text: '刷 卡 来 源 地 比 较',
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
                            formatter: "{a}<br/>{b} : {d} %"
                        },
                        grid: {
                            top: '25%',
                            bottom: '5%',
                            right: '10%'
                        },
                        color: ['rgb(128,232,138)', 'rgb(86,117,238)', 'rgb(255,217,83)', 'rgb(176,214,0)', 'rgb(106,229,255)', 'rgb(228,0,127)', 'rgb(255,126,63)', 'rgb(0,160,233)', 'rgb(231,157,255)', 'rgb(149,149,149)', 'rgb(255,79,195)'],
                        legend: [{
                            data: CompateCharts5Cdata1,
                            top: '15%',
                            width: '100%',
                            itemGap: 15,
                            padding: 2,
                            itemWidth: 14,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            }
                        }, {
                            data: CompateCharts5Cdata2,
                            top: '90%',
                            width: '100%',
                            itemGap: 15,
                            padding: 2,
                            itemWidth: 14,
                            itemHeight: 8,
                            textStyle: {
                                color: '#fff',
                                fontSize: 12,
                            }
                        }],
                        graphic: [{
                            type: 'text',
                            top: 54 - eCharts5Text1Line * 600 / $('#CompareCharts5').height() + '%',
                            left: $('#CompareCharts5').width() * 0.25 - length1 / 2 * 12,
                            z: 9,
                            style: {
                                text: eCharts5Text1,
                                fill: '#fff',
                                textAlign: 'center'
                            }
                        }, {
                            type: 'text',
                            top: 54 - eCharts5Text2Line * 600 / $('#CompareCharts5').height() + '%',
                            left: $('#CompareCharts5').width() * 0.75 - length2 / 2 * 12,
                            z: 9,
                            style: {
                                text: eCharts5Text2,
                                fill: '#fff',
                                textAlign: 'center'
                            }
                        }],
                        series: [
                            {
                                name: name[0],
                                type: 'pie',
                                radius: ['40%', '50%'],
                                center: ['25%', '55%'],
                                data: CompareCharts5data1,
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
                            },
                            {
                                name: name[1],
                                type: 'pie',
                                radius: ['40%', '50%'],
                                center: ['75%', '55%'],
                                data: CompareCharts5data2,
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
                    eCharts5.setOption(option5);
                    $('#CompareCharts5').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var CompareCharts5data1 = [];
                        var CompareCharts5data2 = [];
                        var CompateCharts5Cdata1 = [];
                        var CompateCharts5Cdata2 = [];
                        for (var i = 0; i < BDCOmpare5data1.length; i++) {
                            CompateCharts5Cdata1.push(BDCOmpare5data1[i].Source);
                            CompateCharts5Cdata2.push(BDCOmpare5data2[i].Source);
                            CompareCharts5data1.push({
                                name: BDCOmpare5data1[i].Source,
                                value: Number(BDCOmpare5data1[i].Sum).toFixed(2)
                            });
                            CompareCharts5data2.push({
                                name: BDCOmpare5data2[i].Source,
                                value: Number(BDCOmpare5data2[i].Sum).toFixed(2)
                            });
                        }
                        var eCharts5Text1 = '';
                        var eCharts5Text2 = '';
                        var eCharts5Text1Line = 0;
                        var eCharts5Text2Line = 0;
                        for (var i in name[0]) {
                            if (i % 6 == 0 && i !== '0') {
                                eCharts5Text1 += '\n' + name[0][i];
                                eCharts5Text1Line++;
                            } else {
                                eCharts5Text1 += name[0][i]
                            }
                        }
                        for (var i in name[1]) {
                            if (i % 6 == 0 && i !== '0') {
                                eCharts5Text2 += '\n' + name[1][i];
                                eCharts5Text2Line++;
                            } else {
                                eCharts5Text2 += name[1][i]
                            }
                        }
                        var length1 = eCharts5Text1.length > 6 ? 6 : eCharts5Text1.length
                        var length2 = eCharts5Text2.length > 6 ? 6 : eCharts5Text2.length
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '刷 卡 来 源 地 比 较',
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
                                formatter: "{a}<br/>{b} : {d} %"
                            },
                            grid: {
                                top: '25%',
                                bottom: '5%',
                                left: '10%',
                                right: '10%'
                            },
                            color: ['rgb(128,232,138)', 'rgb(86,117,238)', 'rgb(255,217,83)', 'rgb(176,214,0)', 'rgb(106,229,255)', 'rgb(228,0,127)', 'rgb(255,126,63)', 'rgb(0,160,233)', 'rgb(231,157,255)', 'rgb(149,149,149)', 'rgb(255,79,195)'],
                            graphic: [{
                                type: 'text',
                                top: 54 - eCharts5Text1Line * 600 / $('#fullScreenCharts').height() + '%',
                                left: $('#fullScreenCharts').width() * 0.25 - length1 / 2 * $('body').height() * 0.03,
                                z: 9,
                                style: {
                                    text: eCharts5Text1,
                                    fill: '#fff',
                                    textAlign: 'center',
                                    fontSize: $('body').height() * 0.03,
                                }
                            }, {
                                type: 'text',
                                top: 54 - eCharts5Text2Line * 600 / $('#fullScreenCharts').height() + '%',
                                left: $('#fullScreenCharts').width() * 0.75 - length2 / 2 * $('body').height() * 0.03,
                                z: 9,
                                style: {
                                    text: eCharts5Text2,
                                    fill: '#fff',
                                    textAlign: 'center',
                                    fontSize: $('body').height() * 0.03,
                                }
                            }],
                            series: [
                                {
                                    name: name[0],
                                    type: 'pie',
                                    radius: ['45%', '60%'],
                                    center: ['25%', '55%'],
                                    data: CompareCharts5data1,
                                    labelLine: {
                                        show: true,
                                        length: 20,
                                        length2: 0,
                                        lineStyle: {
                                            color: 'rgba(0,0,0,0)'
                                        }
                                    },
                                    label: {
                                        show: true,
                                        fontWeight: '800',
                                        formatter: function (para) {
                                            return para.name + "：" + para.percent.toFixed(1) + "%"
                                        },
                                        fontSize: $('body').height() * 0.025,
                                    }
                                },
                                {
                                    name: name[1],
                                    type: 'pie',
                                    radius: ['45%', '60%'],
                                    center: ['75%', '55%'],
                                    data: CompareCharts5data2,
                                    labelLine: {
                                        show: true,
                                        length: 20,
                                        length2: 0,
                                        lineStyle: {
                                            color: 'rgba(0,0,0,0)'
                                        }
                                    },
                                    label: {
                                        show: true,
                                        fontWeight: '800',
                                        formatter: function (para) {
                                            return para.name + "：" + para.percent.toFixed(1) + "%"
                                        },
                                        fontSize: $('body').height() * 0.025,
                                    }
                                }
                            ]
                        }
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#CompareCharts5').empty();
                }

                //共享客流
                if (table1[1].result == 'ok' && table2[1].result == 'ok') {
                    var BDCompare6data1 = JSON.parse(table1[1].data);
                    var BDCompare6data2 = JSON.parse(table2[1].data);
                    var CompareCharts6data1 = [];
                    var CompareCharts6data2 = [];
                    var CompareCharts6Cdata1 = [];
                    var CompareCharts6Cdata2 = [];
                    for (var i = 0; i < 5; i++) {
                        if (BDCompare6data1[i]) {
                            CompareCharts6Cdata1.push(BDCompare6data1[i].Name);
                            CompareCharts6data1.push({
                                name: BDCompare6data1[i].Name,
                                value: Number(BDCompare6data1[i].Percent).toFixed(2)
                            });
                        }
                        if (BDCompare6data2[i]) {
                            CompareCharts6Cdata2.push(BDCompare6data2[i].Name);
                            CompareCharts6data2.push({
                                name: BDCompare6data2[i].Name,
                                value: Number(BDCompare6data2[i].Percent).toFixed(2)
                            });
                        }
                    }
                    var eCharts6 = echarts.init(document.getElementById('CompareCharts6'))
                    var option6 = {
                        title: {
                            text: '人 口 共 享 客 流 比 较',
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
                            formatter: "{a}<br/>{b} : {c} %"
                        },
                        grid: [{
                            top: '15%',
                            bottom: '15%',
                            left: '10%',
                            right: '50%'
                        }, {
                            top: '15%',
                            bottom: '15%',
                            left: '55%',
                            right: '5%'
                        }],
                        color: ['rgb(220,20,60)', 'rgb(	0,139,139)'],
                        xAxis: [{
                            type: 'value',
                            axisLine: {
                                show: false
                            },
                            splitLine: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            }
                        }, {
                            gridIndex: 1,
                            type: 'value',
                            axisLine: {
                                show: false
                            },
                            splitLine: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            }
                        }],
                        yAxis: [{
                            type: 'category',
                            data: CompareCharts6Cdata1,
                            inverse: true,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            }
                        }, {
                            gridIndex: 1,
                            type: 'category',
                            data: CompareCharts6Cdata2,
                            inverse: true,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: false
                            }
                        }],
                        graphic: [{
                            type: 'text',
                            top: '90%',
                            left: $('#CompareCharts6').width() * 0.3 - name[0].length / 2 * 12,
                            z: 9,
                            style: {
                                text: name[0],
                                fill: '#fff',
                            }
                        }, {
                            type: 'text',
                            top: '90%',
                            left: $('#CompareCharts6').width() * 0.75 - name[1].length / 2 * 12,
                            z: 9,
                            style: {
                                text: name[1],
                                fill: '#fff',
                            }
                        }],
                        series: [
                            {
                                name: name[0],
                                type: 'bar',
                                data: CompareCharts6data1,
                                label: {
                                    show: true,
                                    position: ['5%', '45%'],
                                    color: '#fff',
                                    formatter: '{b}：{c}%'
                                },
                                xAxisIndex: 0,
                                yAxisIndex: 0
                            },
                            {
                                name: name[1],
                                type: 'bar',
                                data: CompareCharts6data2,
                                label: {
                                    show: true,
                                    position: ['5%', '45%'],
                                    color: '#fff',
                                    formatter: '{b}：{c}%'
                                },
                                xAxisIndex: 1,
                                yAxisIndex: 1
                            }
                        ]
                    }
                    eCharts6.setOption(option6);
                    $('#CompareCharts6').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var CompareCharts6data1Full = [];
                        var CompareCharts6data2Full = [];
                        var CompareCharts6Cdata1Full = [];
                        var CompareCharts6Cdata2Full = [];
                        for (var i = 0; i < BDCompare6data1.length; i++) {
                            CompareCharts6Cdata1Full.push(BDCompare6data1[i].Name);
                            CompareCharts6Cdata2Full.push(BDCompare6data2[i].Name);
                            CompareCharts6data1Full.push({
                                name: BDCompare6data1[i].Name,
                                value: Number(BDCompare6data1[i].Percent).toFixed(2)
                            });
                            CompareCharts6data2Full.push({
                                name: BDCompare6data2[i].Name,
                                value: Number(BDCompare6data2[i].Percent).toFixed(2)
                            });
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '人 口 共 享 客 流 比 较',
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
                                formatter: "{a}<br/>{b} : {c} %"
                            },
                            grid: [{
                                top: '15%',
                                bottom: '15%',
                                left: '10%',
                                right: '50%'
                            }, {
                                top: '15%',
                                bottom: '15%',
                                left: '55%',
                                right: '5%'
                            }],
                            color: ['rgb(220,20,60)', 'rgb(	0,139,139)'],
                            xAxis: [{
                                type: 'value',
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                }
                            }, {
                                gridIndex: 1,
                                type: 'value',
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                }
                            }],
                            yAxis: [{
                                type: 'category',
                                data: CompareCharts6Cdata1Full,
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                }
                            }, {
                                gridIndex: 1,
                                type: 'category',
                                data: CompareCharts6Cdata2Full,
                                inverse: true,
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: false
                                }
                            }],
                            graphic: [{
                                type: 'text',
                                top: '90%',
                                left: $('#fullScreenCharts').width() * 0.3 - name[0].length / 2 * $('body').height() * 0.03,
                                z: 9,
                                style: {
                                    text: name[0],
                                    fill: '#fff',
                                    fontSize: $('body').height() * 0.03
                                }
                            }, {
                                type: 'text',
                                top: '90%',
                                left: $('#fullScreenCharts').width() * 0.75 - name[1].length / 2 * $('body').height() * 0.03,
                                z: 9,
                                style: {
                                    text: name[1],
                                    fill: '#fff',
                                    fontSize: $('body').height() * 0.03
                                }
                            }],
                            series: [
                                {
                                    name: name[0],
                                    type: 'bar',
                                    barWidth: '50%',
                                    data: CompareCharts6data1Full,
                                    label: {
                                        show: true,
                                        position: ['5%', '35%'],
                                        color: '#fff',
                                        formatter: '{b}：{c}%',
                                        fontSize: $('body').height() * 0.025
                                    },
                                    xAxisIndex: 0,
                                    yAxisIndex: 0
                                },
                                {
                                    name: name[1],
                                    type: 'bar',
                                    barWidth: '50%',
                                    data: CompareCharts6data2Full,
                                    label: {
                                        show: true,
                                        position: ['5%', '35%'],
                                        color: '#fff',
                                        formatter: '{b}：{c}%',
                                        fontSize: $('body').height() * 0.025
                                    },
                                    xAxisIndex: 1,
                                    yAxisIndex: 1
                                }
                            ]
                        }
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#CompareCharts6').empty();
                }

                //消费人群标签
                if (table1[5].result == 'ok' && table2[5].result == 'ok') {
                    var BDCompare7data1 = JSON.parse(table1[5].data);
                    var BDCompare7data2 = JSON.parse(table2[5].data);
                    var eCharts7Data1 = [];
                    var eCharts7Data2 = [];
                    var eCharts7Cdata = [];
                    var eCharts7Max = 0;
                    for (var i in BDCompare7data1) {
                        var pro = BDCompare7data1[i];
                        eCharts7Data1.push({
                            name: pro.Property,
                            value: pro.Percent.toFixed(2),
                        })
                        eCharts7Cdata.push(pro.Property);
                        if (pro.Percent > eCharts7Max) {
                            eCharts7Max = pro.Percent;
                        }
                    }
                    for (var i in BDCompare7data2) {
                        var pro = BDCompare7data2[i];
                        eCharts7Data2.push({
                            name: pro.Property,
                            value: pro.Percent.toFixed(2),
                        });
                        if (pro.Percent > eCharts7Max) {
                            eCharts7Max = pro.Percent;
                        }
                    }
                    var CompareCharts7 = echarts.init(document.getElementById('CompareCharts7'));
                    var option7 = {
                        title: {
                            text: '人 口 消 费 人 群 标 签 比 较',
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
                            top: '15%',
                            bottom: '30%'
                        },
                        legend: {
                            data: name,
                            top: '15%',
                            textStyle: {
                                color: '#fff'
                            }
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: '{b}<br/>{a0}：{c0}%<br/>{a1}：{c1}%'
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: eCharts7Cdata,
                                axisPointer: {
                                    type: 'shadow'
                                },
                                axisLabel: {
                                    color: 'rgb(205,210,215)',
                                    interval: 0,
                                    rotate: 15,
                                    margin: 20,
                                    padding: [0, -15]
                                },
                                axisLine: {
                                    show: false
                                },
                                splitLine: {
                                    show: false
                                }
                            }
                        ],
                        yAxis: [
                            {
                                axisTick: {
                                    show: false
                                },
                                axisLine: {
                                    show: false
                                },
                                axisLabel: {
                                    show: true,
                                    color: '#fff',
                                },
                                splitLine: {
                                    show: true,
                                    lineStyle: {
                                        color: '#365E69',
                                        type: 'dashed'
                                    }
                                },
                                max: Math.round(eCharts7Max + 10),
                                name: '百分比（%）',
                                nameGap: 25,
                                nameLocation: 'middle',
                                nameTextStyle: {
                                    color: '#fff',
                                    verticalAligh: 'middle'
                                }
                            }
                        ],
                        series: [
                            {
                                name: name[0],
                                type: 'bar',
                                data: eCharts7Data1,
                                barWidth: '15%',
                                animation: true,
                                itemStyle: {
                                    color: 'rgb(7,125,216)',
                                }
                            }, {
                                name: name[1],
                                type: 'bar',
                                data: eCharts7Data2,
                                barWidth: '15%',
                                animation: true,
                                itemStyle: {
                                    color: 'rgb(7,209,216)',
                                }
                            }
                        ]
                    };
                    CompareCharts7.setOption(option7);
                    $('#CompareCharts7').on('click', function () {
                        $('body').append("<div id='fullScreenCharts'></div>")
                        $('#fullScreenCharts').css({
                            width: '100%',
                            height: '95%',
                        })
                        var eCharts7Data1Full = [];
                        var eCharts7Data2Full = [];
                        var eCharts7CdataFull = [];
                        var eCharts7MaxFull = 0;
                        for (var i in BDCompare7data1) {
                            var pro = BDCompare7data1[i];
                            eCharts7Data1Full.push({
                                name: pro.Property,
                                value: pro.Percent.toFixed(2),
                            })
                            eCharts7CdataFull.push(pro.Property);
                            if (pro.Percent > eCharts7MaxFull) {
                                eCharts7MaxFull = pro.Percent;
                            }
                        }
                        for (var i in BDCompare7data2) {
                            var pro = BDCompare7data2[i];
                            eCharts7Data2Full.push({
                                name: pro.Property,
                                value: pro.Percent.toFixed(2),
                            });
                            if (pro.Percent > eCharts7MaxFull) {
                                eCharts7MaxFull = pro.Percent;
                            }
                        }
                        var ec = echarts.init(document.getElementById('fullScreenCharts'));
                        var option = {
                            title: {
                                text: '人 口 消 费 人 群 标 签 比 较',
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
                                bottom: '15%'
                            },
                            legend: {
                                data: name,
                                top: '10%',
                                textStyle: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02
                                }
                            },
                            tooltip: {
                                trigger: 'axis',
                                formatter: '{b}<br/>{a0}：{c0}%<br/>{a1}：{c1}%',
                                textStyle: {
                                    color: '#fff',
                                    fontSize: $('body').height() * 0.02
                                }
                            },
                            xAxis: [
                                {
                                    type: 'category',
                                    data: eCharts7CdataFull,
                                    axisPointer: {
                                        type: 'shadow'
                                    },
                                    axisLabel: {
                                        color: 'rgb(205,210,215)',
                                        interval: 0,
                                        rotate: 15,
                                        margin: $('body').height() * 0.03,
                                        padding: [0, -15],
                                        fontSize: $('body').height() * 0.02
                                    },
                                    axisLine: {
                                        show: false
                                    },
                                    splitLine: {
                                        show: false
                                    }
                                }
                            ],
                            yAxis: [
                                {
                                    axisTick: {
                                        show: false
                                    },
                                    axisLine: {
                                        show: false
                                    },
                                    axisLabel: {
                                        show: true,
                                        color: '#fff',
                                        fontSize: $('body').height() * 0.02
                                    },
                                    splitLine: {
                                        show: true,
                                        lineStyle: {
                                            color: '#365E69',
                                            type: 'dashed'
                                        }
                                    },
                                    max: Math.round(eCharts7MaxFull + 10),
                                    name: '百分比（%）',
                                    nameGap: $('body').width() * 0.03,
                                    nameLocation: 'middle',
                                    nameTextStyle: {
                                        color: '#fff',
                                        verticalAligh: 'middle',
                                        fontSize: $('body').height() * 0.02
                                    }
                                }
                            ],
                            series: [
                                {
                                    name: name[0],
                                    type: 'bar',
                                    data: eCharts7Data1Full,
                                    barWidth: '15%',
                                    animation: true,
                                    itemStyle: {
                                        color: 'rgb(7,125,216)',
                                    }
                                }, {
                                    name: name[1],
                                    type: 'bar',
                                    data: eCharts7Data2Full,
                                    barWidth: '15%',
                                    animation: true,
                                    itemStyle: {
                                        color: 'rgb(7,209,216)',
                                    }
                                }
                            ]
                        };
                        ec.setOption(option);
                        $('#fullScreenCharts').on('click', function () {
                            $('#fullScreenCharts').remove();
                        })
                    })
                } else {
                    $('#CompareCharts7').empty();
                }
                return
            }
        })
    }
    function BDCompareHide() {
        $('#PKBDSelect').show();
        highlightDistrictEnable = true;
        if (pkBD.length !== 0) {
            for (var i in pkBD) {
                var e = pkBD[i];
                $('#PKBDSelect .BDItem[value=' + e.BDName + ']').removeClass('selected');
                e.label.show = false;
                if (e.BDType == '市级街道') {
                    e.billboard.image = "img/shangquan_big.png"
                    e.label.pixelOffset = new Cesium.Cartesian2(0, 28)
                } else {
                    e.billboard.image = "img/shangquan_small.png"
                    e.label.pixelOffset = new Cesium.Cartesian2(0, 16)
                }
            }
            pkBD = [];
        };
        for (var i in BDArea) {
            for (var x in BDArea[i]) {
                viewer.entities.getById(BDArea[i][x]).show = false;
            }
        }
        $('.CompareCharts').hide();
    }

    function init() {
        $('#PKBDSelect').show();
        getTopBD();
        $('#PKBDSelect .POIItem .BDContainer').empty();
        var url = serviceHost + "GetSHSQData?district=" + sessionStorage['roleDetail']
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                var bdlist = response
                bdlist = eval("(" + bdlist + ")")
                for (var i in bdlist) {
                    var bd = bdlist[i];
                    $('#PKBDSelect .POIItem[value=' + bd.District + '] .BDContainer').append('<div class="BDItem" value="' + bd.Name + '"><div class="BDItemText">' + bd.Name + '</div></div>')
                }
                $("#PKBDSelect .POIItem .BDItem").on('click', function () {
                    $(this).hasClass('selected') ? $(this).removeClass('selected') : $(this).addClass('selected')
                    if ($(this).hasClass('selected')) {
                        var selectID = ""
                        for (var i in BDClass1Entity) {
                            if (viewer.entities.getById(BDClass1Entity[i]).BDName == $(this).attr('value')) {
                                selectID = BDClass1Entity[i]
                            }
                        }
                        for (var i in BDClass2Entity) {
                            if (viewer.entities.getById(BDClass2Entity[i]).BDName == $(this).attr('value')) {
                                selectID = BDClass2Entity[i]
                            }
                        }
                        pkBD.push(viewer.entities.getById(selectID));
                        viewer.entities.getById(selectID).show = true;
                        viewer.entities.getById(selectID).label.show = true;
                        viewer.entities.getById(selectID).billboard.image = "img/shangquan_big_d.png";
                        viewer.entities.getById(selectID).label.pixelOffset = new Cesium.Cartesian2(0, 30)
                        if (pkBD.length == 2) {
                            setTimeout(function () {
                                BDCompareCreate();
                            }, 1000);
                        }
                    }
                })
            }
        })
        $('#PKBDSelect .POIItem').off('mouseenter').unbind('mouseleave');
        $("#PKBDSelect .POIItem").hover(function () {
            $(this).find('.BDContainer').show()
        }, function () {
            $(this).find('.BDContainer').hide()
        })
    }

    return {
        create: BDCompareCreate,
        hide: BDCompareHide,
        init: init
    }
}();
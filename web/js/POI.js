var POI = function () {
    function showPOI(type) {
        if (type == 'heatmap') {
            hideIcon();
            if ($('.POIItem[value=便利店]').hasClass('selected')) {
                BLDHeatmap._layer.show = true;
            }
            if ($('.POIItem[value=酒吧]').hasClass('selected')) {
                JBHeatmap._layer.show = true;
            }
            if ($('.POIItem[value=运动健身]').hasClass('selected')) {
                YDJSHeatmap._layer.show = true;
            }
            if ($('.POIItem[value=咖啡馆]').hasClass('selected')) {
                KFGHeatmap._layer.show = true;
            }
            if ($('.POIItem[value=水果生鲜]').hasClass('selected')) {
                SGHeatmap._layer.show = true;
            }
            if ($('.POIItem[value=地铁]').hasClass('selected')) {
                DTHeatmap._layer.show = true;
            }
            if ($('.POIItem[value=公交]').hasClass('selected')) {
                GJHeatmap._layer.show = true;
            }
        } else {
            hideHeatmap();
            if ($('.POIItem[value=便利店]').hasClass('selected')) {
                for (var i in BLDEntity) {
                    viewer.entities.getById(BLDEntity[i]).show = true;
                }
            }
            if ($('.POIItem[value=酒吧]').hasClass('selected')) {
                for (var i in JBEntity) {
                    viewer.entities.getById(JBEntity[i]).show = true;
                }
            }
            if ($('.POIItem[value=运动健身]').hasClass('selected')) {
                for (var i in YDJSEntity) {
                    viewer.entities.getById(YDJSEntity[i]).show = true;
                }
            }
            if ($('.POIItem[value=咖啡馆]').hasClass('selected')) {
                for (var i in KFGEntity) {
                    viewer.entities.getById(KFGEntity[i]).show = true;
                }
            }
            if ($('.POIItem[value=水果生鲜]').hasClass('selected')) {
                for (var i in SGEntity) {
                    viewer.entities.getById(SGEntity[i]).show = true;
                }
            }
            if ($('.POIItem[value=地铁]').hasClass('selected')) {
                for (var i in DTEntity) {
                    viewer.entities.getById(DTEntity[i]).show = true;
                }
            }
            if ($('.POIItem[value=公交]').hasClass('selected')) {
                for (var i in GJEntity) {
                    viewer.entities.getById(GJEntity[i]).show = true;
                }
            }
        }
    }

    function hideHeatmap() {
        if (SGHeatmap && SGHeatmap._layer) {
            SGHeatmap._layer.show = false;
            BLDHeatmap._layer.show = false;
            KFGHeatmap._layer.show = false;
            JBHeatmap._layer.show = false;
            YDJSHeatmap._layer.show = false;
            GJHeatmap._layer.show = false;
            DTHeatmap._layer.show = false;
            CSHeatmap._layer.show = false;
            YDHeatmap._layer.show = false;
            SQFWHeatmap._layer.show = false;
        } else {
            setTimeout(function(){
                hideHeatmap();
            },500)
        }
    }
    function hideIcon() {
        for (var i in BLDEntity) {
            viewer.entities.getById(BLDEntity[i]).show = false;
        }
        for (var i in JBEntity) {
            viewer.entities.getById(JBEntity[i]).show = false;
        }
        for (var i in YDJSEntity) {
            viewer.entities.getById(YDJSEntity[i]).show = false;
        }
        for (var i in KFGEntity) {
            viewer.entities.getById(KFGEntity[i]).show = false;
        }
        for (var i in SGEntity) {
            viewer.entities.getById(SGEntity[i]).show = false;
        }
        for (var i in GJEntity) {
            viewer.entities.getById(GJEntity[i]).show = false;
        }
        for (var i in DTEntity) {
            viewer.entities.getById(DTEntity[i]).show = false;
        }
        for (var i in CSEntity) {
            viewer.entities.getById(CSEntity[i]).show = false;
        }
        for (var i in YDEntity) {
            viewer.entities.getById(YDEntity[i]).show = false;
        }
        for (var i in SQFWEntity) {
            viewer.entities.getById(SQFWEntity[i]).show = false;
        }
    }
    function hidePOI() {
        hideHeatmap();
        hideIcon();
        $('#ToolBar').hide();
        $('#POIControl').hide();
    }

    function POIToolBar() {
        $('#ToolBar').empty();
        $('#ToolBar').show();
        $('#POIControl').show();
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(serviceHost + "GetBlockNDistrict", "UTF-8"),
            dataType: "json",
            success: function (response) {
                var data = eval('(' + response + ')');
                //console.log(data)
                $('#ToolBar').append('<select id="district"></select>');
                for (var i in data.district) {
                    $('#ToolBar #district').append('<option value="' + data.district[i].MC + '">' + data.district[i].MC + '</option>')
                }
                $('#ToolBar #district').on('change', function () {
                    var d = $(this).val();
                    for (var i in districtEnveloped.features) {
                        var f = districtEnveloped.features[i];
                        if (f.properties.Name == d) {
                            var e = f.geometry.coordinates[0];
                            viewer.camera.flyTo({
                                destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
                                duration: 3,
                            });
                            setTimeout(function () {
                                onWheel();
                            }, 3000)
                        }
                    }
                    $('#ToolBar #block').remove();
                    $('#ToolBar #district').after('<select id="block"></select>');
                    for (var i in data.block) {
                        if (data.block[i].District == d) {
                            $('#ToolBar #block').append('<option value="' + data.block[i].Block + '">' + data.block[i].Block + '</option>')
                        }
                    }
                    $('#ToolBar #block').on('change', function () {
                        var b = $(this).val();
                        for (var i in blockEnveloped.features) {
                            var f = blockEnveloped.features[i];
                            if (f.properties.Name == b) {
                                var e = f.geometry.coordinates[0];
                                viewer.camera.flyTo({
                                    destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
                                    duration: 3,
                                });
                                setTimeout(function () {
                                    onWheel();
                                }, 3000)
                            }
                        }
                    })
                })
                $(".POIItem[value=地铁]").trigger('click')
                //$('#ToolBar #district').trigger('change');
            }
        })
    }

    function flowSearch(center, radius, time) {
        $(".FlowCharts").show();
        $('.FlowChartsBack').width($('#FlowCharts1').width() + 5)
        var titleText = time.split('-')[1] + '月' + time.split('-')[2] + '日小时客流分布'
        var circle = turf.circle([center.split(",")[0], center.split(",")[1]], radius / 1000);
        var area = Number(turf.area(circle)) / 1000000;
        var block = [];
        var QX = []
        for (var i in shblock.features) {
            var b = shblock.features[i];
            if (b.geometry.type == 'Polygon') {
                var intersection = turf.intersect(b, circle);
                var within = turf.booleanWithin(b, circle)
                if (intersection || within) {
                    if (sessionStorage['roleDetail'] !== '') {
                        if (b.properties.QX == sessionStorage['roleDetail']) {
                            block.push(b.properties.NAME);
                            QX.push(b.properties.QX);
                        }
                    } else {
                        block.push(b.properties.NAME);
                        QX.push(b.properties.QX);
                    }

                }
            } else {
                for (var x in b.geometry.coordinates) {
                    var p = turf.polygon(b.geometry.coordinates[x])
                    var intersection = turf.intersect(p, circle);
                    var within = turf.booleanWithin(p, circle)
                    if (intersection || within) {
                        if (sessionStorage['roleDetail'] !== '') {
                            if (b.properties.QX == sessionStorage['roleDetail']) {
                                block.push(b.properties.NAME);
                                QX.push(b.properties.QX);
                            }
                        } else {
                            block.push(b.properties.NAME);
                            QX.push(b.properties.QX);
                        }
                    }
                }
            }

        }
        QX = arrayDistinct(QX);
        $('#FlowCharts1').empty();
        $('#FlowCharts1').append('<div class="FlowCharts1Title">' + QX.join(",") + '</div>')
        $('#FlowCharts1').append('<div class="FlowCharts1Content">' + block.join(",") + '<br/><br/>面积：' + area.toFixed(2) + '平方公里</div>');
        $('.FlowCharts1Title').css('line-height', $('.FlowCharts1Title').height() + 'px')
        var url = serviceHost + "GetCustomerFlowDataByCircleTime?center=" + center + "&radius=" + radius + "&time=" + time + "&district=" + sessionStorage['roleDetail'];
        //console.log(url);
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (data) {
                data = eval('(' + data + ')');
                console.log(data)
                $('#FlowCharts3').empty();
                $('#FlowCharts3').append('<div class="FlowCharts3Title">便 民 设 施 统 计</div>')
                $('.FlowCharts3Title').css('line-height', $('.FlowCharts3Title').height() + 'px')
                $('#FlowCharts3').append('<table></table>')
                $('#FlowCharts3 table').append('<thead><tr><th></th><th>总数</th><th>密度（每平方公里）</th></tr></thead>')
                $('#FlowCharts3 table').append('<tbody></tbody>')
                for (var i in data[1]) {
                    var html = '<tr>'
                    html += '<td>' + data[1][i].Name + '</td>';
                    html += '<td>' + data[1][i].Num + '</td>';
                    html += '<td>' + (data[1][i].Num / area).toFixed(3) + '</td>';
                    html += '</tr>';
                    $('#FlowCharts3 table tbody').append(html);
                }

                var FlowCharts2Catalogy = [];
                var FlowCharts2Shadow = [];
                var FlowCharts2Data = [];
                var FlowCharts2MaxValue = 0;
                var FlowCharts2MinValue = 1e10;
                for (var i in data[0]) {
                    var d = data[0][i];
                    if (Number(d.Flow) > FlowCharts2MaxValue) {
                        FlowCharts2MaxValue = Number(d.Flow)
                    }
                    if (Number(d.Flow) < FlowCharts2MinValue) {
                        FlowCharts2MinValue = Number(d.Flow)
                    }
                };
                FlowCharts2MaxValue += 0;
                FlowCharts2MinValue = (FlowCharts2MinValue - 10000) > 0 ? (FlowCharts2MinValue - 10000) : 10000
                for (var i in data[0]) {
                    var d = data[0][i]
                    FlowCharts2Catalogy.push(d.Time);
                    FlowCharts2Data.push(d.Flow);
                    FlowCharts2Shadow.push(FlowCharts2MaxValue)
                };
                var FlowCharts2 = echarts.init(document.getElementById('FlowCharts2'));
                var option2 = {
                    title: {
                        text: titleText,
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
                        bottom: '15%'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line',
                        },
                        formatter: function (para) {
                            return data[0][para[0].dataIndex].Time.split(" ")[1].split(':')[0] + "点：" + Number(data[0][para[0].dataIndex].Flow) + "人"
                        }
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: FlowCharts2Catalogy,
                            axisPointer: {
                                type: 'shadow'
                            },
                            axisLabel: {
                                color: 'rgb(205,210,215)',
                                interval: 0,
                                rotate: 0,
                                formatter: function (value, index) {
                                    if (index % 2 == 0) {
                                        return value.split(' ')[1].split(":")[0]
                                    } else {
                                        return '\n' + value.split(' ')[1].split(":")[0]
                                    }
                                }
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
                            name: '客流量（人）',
                            nameLocation: 'end',
                            nameTextStyle: {
                                color: 'rgb(255,255,255)',
                            },
                            axisTick: {
                                show: false
                            },
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: true,
                                showMaxLabel: false,
                                color: 'rgb(255,255,255)',
                                margin: 15,
                                showMinLabel: false,
                            },
                            splitLine: {
                                show: false
                            },
                            max: FlowCharts2MaxValue,
                            min: FlowCharts2MinValue - 10000
                        }
                    ],
                    series: [
                        {
                            name: 'shadow',
                            type: 'bar',
                            data: FlowCharts2Shadow,
                            itemStyle: {
                                color: 'rgb(255,255,255,0.1)',
                            },
                            barGap: '-100%',
                            barWidth: '15%',
                            animation: false,
                        },
                        {
                            type: 'bar',
                            data: FlowCharts2Data,
                            barWidth: '15%',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1,
                                    [
                                        { offset: 1, color: 'rgb(0,136,218)' },
                                        { offset: 0, color: 'rgb(80,167,227)' }
                                    ]
                                ),
                                barBorderRadius: 15
                            }
                        }
                    ]
                };
                FlowCharts2.setOption(option2);
                $(".FlowCharts").show();
            }
        })
    }

    function flowSeachPolygon(points,time){
        $(".FlowCharts").show();
        var pts = points;
        pts = pts.concat([pts[0]]);
        $('.FlowChartsBack').width($('#FlowCharts1').width() + 5)
        var titleText = time.split('-')[1] + '月' + time.split('-')[2] + '日小时客流分布'
        var polygon = turf.polygon([pts]);
        var area = Number(turf.area(polygon)) / 1000000;
        var block = [];
        var QX = []
        for (var i in shblock.features) {
            var b = shblock.features[i];
            if (b.geometry.type == 'Polygon') {
                var intersection = turf.intersect(b, polygon);
                var within = turf.booleanWithin(b, polygon)
                if (intersection || within) {
                    if (sessionStorage['roleDetail'] !== '') {
                        if (b.properties.QX == sessionStorage['roleDetail']) {
                            block.push(b.properties.NAME);
                            QX.push(b.properties.QX);
                        }
                    } else {
                        block.push(b.properties.NAME);
                        QX.push(b.properties.QX);
                    }

                }
            } else {
                for (var x in b.geometry.coordinates) {
                    var p = turf.polygon(b.geometry.coordinates[x])
                    var intersection = turf.intersect(p, polygon);
                    var within = turf.booleanWithin(p, polygon)
                    if (intersection || within) {
                        if (sessionStorage['roleDetail'] !== '') {
                            if (b.properties.QX == sessionStorage['roleDetail']) {
                                block.push(b.properties.NAME);
                                QX.push(b.properties.QX);
                            }
                        } else {
                            block.push(b.properties.NAME);
                            QX.push(b.properties.QX);
                        }
                    }
                }
            }

        }
        QX = arrayDistinct(QX);
        $('#FlowCharts1').empty();
        $('#FlowCharts1').append('<div class="FlowCharts1Title">' + QX.join(",") + '</div>')
        $('#FlowCharts1').append('<div class="FlowCharts1Content">' + block.join(",") + '<br/><br/>面积：' + area.toFixed(2) + '平方公里</div>');
        $('.FlowCharts1Title').css('line-height', $('.FlowCharts1Title').height() + 'px');
        ptsString = "";
        for(var i in pts){
            ptsString += pts[i][0] + ',' + pts[i][1] + ';'
        }
        var url = serviceHost + "GetCustomerFlowDataByPolygonTime?ptsString=" + ptsString + "&time=" + time + "&district=" + sessionStorage['roleDetail'];
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (data) {
                data = eval('(' + data + ')');
                //console.log(data)
                $('#FlowCharts3').empty();
                $('#FlowCharts3').append('<div class="FlowCharts3Title">便 民 设 施 统 计</div>')
                $('.FlowCharts3Title').css('line-height', $('.FlowCharts3Title').height() + 'px')
                $('#FlowCharts3').append('<table></table>')
                $('#FlowCharts3 table').append('<thead><tr><th></th><th>总数</th><th>密度（每平方公里）</th></tr></thead>')
                $('#FlowCharts3 table').append('<tbody></tbody>')
                for (var i in data[1]) {
                    var html = '<tr>'
                    html += '<td>' + data[1][i].Name + '</td>';
                    html += '<td>' + data[1][i].Num + '</td>';
                    html += '<td>' + (data[1][i].Num / area).toFixed(3) + '</td>';
                    html += '</tr>';
                    $('#FlowCharts3 table tbody').append(html);
                }

                var FlowCharts2Catalogy = [];
                var FlowCharts2Shadow = [];
                var FlowCharts2Data = [];
                var FlowCharts2MaxValue = 0;
                var FlowCharts2MinValue = 1e10;
                for (var i in data[0]) {
                    var d = data[0][i];
                    if (Number(d.Flow) > FlowCharts2MaxValue) {
                        FlowCharts2MaxValue = Number(d.Flow)
                    }
                    if (Number(d.Flow) < FlowCharts2MinValue) {
                        FlowCharts2MinValue = Number(d.Flow)
                    }
                };
                FlowCharts2MaxValue += 0;
                FlowCharts2MinValue = (FlowCharts2MinValue - 10000) > 0 ? (FlowCharts2MinValue - 10000) : 10000
                for (var i in data[0]) {
                    var d = data[0][i]
                    FlowCharts2Catalogy.push(d.Time);
                    FlowCharts2Data.push(d.Flow);
                    FlowCharts2Shadow.push(FlowCharts2MaxValue)
                };
                var FlowCharts2 = echarts.init(document.getElementById('FlowCharts2'));
                var option2 = {
                    title: {
                        text: titleText,
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
                        bottom: '15%'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'line',
                        },
                        formatter: function (para) {
                            return data[0][para[0].dataIndex].Time.split(" ")[1].split(':')[0] + "点：" + Number(data[0][para[0].dataIndex].Flow) + "人"
                        }
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: FlowCharts2Catalogy,
                            axisPointer: {
                                type: 'shadow'
                            },
                            axisLabel: {
                                color: 'rgb(205,210,215)',
                                interval: 0,
                                rotate: 0,
                                formatter: function (value, index) {
                                    if (index % 2 == 0) {
                                        return value.split(' ')[1].split(":")[0]
                                    } else {
                                        return '\n' + value.split(' ')[1].split(":")[0]
                                    }
                                }
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
                            name: '客流量（人）',
                            nameLocation: 'end',
                            nameTextStyle: {
                                color: 'rgb(255,255,255)',
                            },
                            axisTick: {
                                show: false
                            },
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: true,
                                showMaxLabel: false,
                                color: 'rgb(255,255,255)',
                                margin: 15,
                                showMinLabel: false,
                            },
                            splitLine: {
                                show: false
                            },
                            max: FlowCharts2MaxValue,
                            min: FlowCharts2MinValue - 10000
                        }
                    ],
                    series: [
                        {
                            name: 'shadow',
                            type: 'bar',
                            data: FlowCharts2Shadow,
                            itemStyle: {
                                color: 'rgb(255,255,255,0.1)',
                            },
                            barGap: '-100%',
                            barWidth: '15%',
                            animation: false,
                        },
                        {
                            type: 'bar',
                            data: FlowCharts2Data,
                            barWidth: '15%',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(
                                    0, 0, 0, 1,
                                    [
                                        { offset: 1, color: 'rgb(0,136,218)' },
                                        { offset: 0, color: 'rgb(80,167,227)' }
                                    ]
                                ),
                                barBorderRadius: 15
                            }
                        }
                    ]
                };
                FlowCharts2.setOption(option2);
                $(".FlowCharts").show();
            }
        })
    }

    function flowSearchHide() {
        $('.FlowCharts').hide();
    }

    function drawPOI() {
        var url = serviceHost + "GetPOIData?district=" + sessionStorage['roleDetail']
        $.ajax({
            cache: false,
            type: "Get",
            url: encodeURI(url, "UTF-8"),
            dataType: "json",
            success: function (response) {
                var data = eval('(' + response + ')');
                var bounds = {
                    west: 120.85243080094398,
                    east: 121.9732900418345,
                    south: 30.681769703282963,
                    north: 31.866139843558738
                };
                var radiusFactor = 60;
                var spacingFactor = 1.5;
                var maxOpacity = 0.5;
                var minOpacity = 0;
                var blur = 0.85
                YDJSHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgba(0,0,0,0)',
                            '0.5':"rgb(255,155,240)",
                            '1': 'rgba(255,97,231,1)'
                        },
                    }
                );
                var dataYDJSHeatmap = [];
                SGHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgba(0,0,0,0)',
                            '0.5':"rgb(255,175,111)",
                            '1': 'rgba(255,137,42,1)'
                        },
                    }
                );
                var dataSGHeatmap = []
                BLDHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgba(0,0,0,0)',
                            '0.5':"rgb(121,255,206)",
                            '1': 'rgba(0,255,143,1)'
                        },
                    }
                );
                var dataBLDHeatmap = [];
                KFGHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgba(0,0,0,0)',
                            '0.5':"rgb(247,213,108)",
                            '1': 'rgba(224,176,28,1)'
                        },
                    }
                );
                var dataKFGHeatmap = [];
                JBHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgba(0,0,0,0)',
                            '0.5':"rgb(159,226,255)",
                            '1': 'rgba(97,208,255,1)'
                        },
                    }
                );
                var dataJBHeatmap = []
                GJHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgb(0,0,0)',
                            '0.5': 'rgb(152,193,255)',
                            '1': 'rgb(97,160,255)'
                        },
                    }
                );
                var dataGJHeatmap = [];
                DTHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgb(0,0,0)',
                            '0.5':"rgb(255,138,135)",
                            '1': 'rgb(232,78,78)'
                        },
                    }
                );
                var dataDTHeatmap = [];

                CSHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgb(0,0,0)',
                            '0.5':"rgb(217,241,122)",
                            '1': 'rgb(158,158,38)'
                        },
                    }
                );
                var dataCSHeatmap = [];
                YDHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgb(0,0,0)',
                            '0.5':"rgb(145,184,255)",
                            '1': 'rgb(77,134,237)'
                        },
                    }
                );
                var dataYDHeatmap = [];
                SQFWHeatmap = CesiumHeatmap.create(
                    viewer,
                    bounds,
                    {
                        radiusFactor: radiusFactor,
                        spacingFactor: spacingFactor,
                        maxOpacity: maxOpacity,
                        minOpacity: minOpacity,
                        blur: blur,
                        gradient: {
                            '0': 'rgb(0,0,0)',
                            '0.5':'rgb(255,124,161)',
                            '1': "rgb(241,56,108)"
                        },
                    }
                );
                var dataSQFWHeatmap = [];

                var valueMin = 0;
                var valueMax = 3;
                for (var i in data.Table) {
                    var imgUrl = "";
                    var category = data.Table[i].Category
                    if (category == '运动健身') {
                        dataYDJSHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '便利店') {
                        dataBLDHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '咖啡馆') {
                        dataKFGHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '酒吧') {
                        dataJBHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '水果生鲜') {
                        dataSGHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '超市') {
                        dataCSHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '药店') {
                        dataYDHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '社区服务') {
                        dataSQFWHeatmap.push({
                            'x': data.Table[i].Longitude,
                            'y': data.Table[i].Latitude,
                            'value': 1
                        })
                    }
                    if (category == '运动健身') {
                        imgUrl = 'img/jianshenfang.png'
                    } else if (category == '便利店') {
                        imgUrl = 'img/bianlidian.png'
                    } else if (category == '咖啡馆') {
                        imgUrl = 'img/kafeiguan.png'
                    } else if (category == '酒吧') {
                        imgUrl = 'img/jiuba.png'
                    } else if (category == '水果生鲜') {
                        imgUrl = 'img/shuiguodian.png'
                    } else if (category == '超市') {
                        imgUrl = 'img/chaoshi.png'
                    } else if (category == '药店') {
                        imgUrl = 'img/yaodian.png'
                    } else if (category == '社区服务') {
                        imgUrl = 'img/shequfuwu.png'
                    }
                    var a = viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(data.Table[i].Longitude, data.Table[i].Latitude),
                        billboard: {
                            image: imgUrl,
                            show: true,
                            scale: 0.618,
                        },
                        show: false
                    });
                    if (category == '运动健身') {
                        YDJSEntity.push(a.id);
                    } else if (category == '便利店') {
                        BLDEntity.push(a.id);
                    } else if (category == '咖啡馆') {
                        KFGEntity.push(a.id);
                    } else if (category == '酒吧') {
                        JBEntity.push(a.id);
                    } else if (category == '水果生鲜') {
                        SGEntity.push(a.id);
                    } else if (category == '超市') {
                        CSEntity.push(a.id);
                    } else if (category == '药店') {
                        YDEntity.push(a.id);
                    } else if (category == '社区服务') {
                        SQFWEntity.push(a.id);
                    }
                }
                for (var i in data.Table1) {
                    var category = data.Table1[i].Category
                    var imgUrl = "";
                    if (category == '公交') {
                        dataGJHeatmap.push({
                            'x': data.Table1[i].Longitude,
                            'y': data.Table1[i].Latitude,
                            'value': 1
                        })
                    } else if (category == '地铁') {
                        dataDTHeatmap.push({
                            'x': data.Table1[i].Longitude,
                            'y': data.Table1[i].Latitude,
                            'value': 1
                        })
                    }
                    if (category == '公交') {
                        imgUrl = 'img/gongjiaozhan.png'
                    } else if (category == '地铁') {
                        imgUrl = 'img/ditie.png'
                    }
                    var a = viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(data.Table1[i].Longitude, data.Table1[i].Latitude),
                        billboard: {
                            image: imgUrl,
                            show: true,
                            scale: 0.618,
                        },
                        show: false
                    });
                    if (category == '公交') {
                        GJEntity.push(a.id);
                    } else if (category == '地铁') {
                        DTEntity.push(a.id);
                    }
                }

                YDJSHeatmap.setWGS84Data(valueMin, valueMax, dataYDJSHeatmap);
                YDJSHeatmap._layer.show = false;

                SGHeatmap.setWGS84Data(valueMin, valueMax, dataSGHeatmap);
                SGHeatmap._layer.show = false;

                BLDHeatmap.setWGS84Data(valueMin, valueMax, dataBLDHeatmap);
                BLDHeatmap._layer.show = false;

                KFGHeatmap.setWGS84Data(valueMin, valueMax, dataKFGHeatmap);
                KFGHeatmap._layer.show = false;

                JBHeatmap.setWGS84Data(valueMin, valueMax, dataJBHeatmap);
                JBHeatmap._layer.show = false;

                GJHeatmap.setWGS84Data(valueMin, valueMax, dataGJHeatmap);
                GJHeatmap._layer.show = false;

                DTHeatmap.setWGS84Data(valueMin, valueMax, dataDTHeatmap);
                DTHeatmap._layer.show = false;

                CSHeatmap.setWGS84Data(valueMin, valueMax, dataCSHeatmap);
                CSHeatmap._layer.show = false;

                YDHeatmap.setWGS84Data(valueMin, valueMax, dataYDHeatmap);
                YDHeatmap._layer.show = false;

                SQFWHeatmap.setWGS84Data(valueMin, valueMax, dataSQFWHeatmap);
                SQFWHeatmap._layer.show = false;
            }, error: function (response) {
                console.log(response)
            }
        })
    }

    return {
        create: flowSearch,
        createPolygon:flowSeachPolygon,
        hide: flowSearchHide,
        showPOI: showPOI,
        hidePOI: hidePOI,
        POIToolBar: POIToolBar,
        drawPOI: drawPOI
    }
}();
var baseLayerList = {
    satellite: undefined,
    dark: undefined,
    custom: undefined
}

var ClickCityEnable = false;

var SHIconID = "";

var highlightDistrictEnable = false;
var ClickDistrictEnable = false;

var drawCircleEnable = false;
var circleCenter = [];
var drawCircle = undefined;
var drawCircleRadius = 0;
var drawCircleEllipse;

var drawPolygonEnable = false;
var drawPolygonPoints = [];
var tempPolygonPoints = [];
var drawPolygon = undefined;

var districtJson;
var districtEntity = {};
var districtPolygon = {};
var districtEntitySelected = [];

var flylineEntity = [];
var flylineIconEntity = [];
var BDClass1Entity = [];
var BDClass2Entity = [];
var ClickBDEnable = false;
var BDTilesetList = {
    '淮海路街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/淮海路商圈/SceneServer'],
        layer: undefined,
        extent: [121.45239513700005, 31.21460127200004, 121.48028825000006, 31.231985269000063]
    },
    '南京西路街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/南京西路商圈/SceneServer'],
        layer: undefined,
        extent: [121.4376302500001, 31.222279555000057, 121.4622182280001, 31.234594182000023]
    },
    '豫园街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/豫园商圈/SceneServer'],
        layer: undefined,
        extent: [121.48306614500007, 31.223223414000074, 121.4944797610001, 31.231337617000065]
    },
    '南京东路街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/南京东路商圈/SceneServer'],
        layer: undefined,
        extent: [121.46926678600005, 31.233799876000035, 121.48575655200011, 31.241487987000028]
    },
    '徐家汇街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/徐家汇商圈/SceneServer'],
        layer: undefined,
        extent: [121.42614800400008, 31.190933276000067, 121.43752356900006, 31.202023974000042]
    },
    '五角场街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/五角场商圈/SceneServer'],
        layer: undefined,
        extent: [121.50294747200007, 31.295928592000053, 121.51567604900004, 31.306519698000045]
    },
    '中山公园街道': {
        url: ['http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/中山公园商圈/SceneServer'],
        layer: undefined,
        extent: [121.40656915700004, 31.214539182000067, 121.41945214900011, 31.22626085400003]
    },
    '小陆家嘴-张杨路街道': {
        url: [
            'http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/小陆家嘴_张杨路商圈01/SceneServer',
            'http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/小陆家嘴_张杨路商圈02/SceneServer',
            'http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/小陆家嘴_张杨路商圈03/SceneServer'
        ],
        layer: undefined,
        extent: [121.49159410200002, 31.223293024000043, 121.53280987200003, 31.244284014000073]
    },
};
var bdLayers = [];
var BDCenter = [];
var BDArea = {};
var BDAreaPolygon = {};
var bdtop2list = [];

var clickBDid = ""
var hoverBDid = ""
var highlightBDEnbale = false;

var pkEnable = false;
var pKBD = [];

var POIList = {};
//便利店
var BLDHeatmap;
var BLDEntity = [];
//酒吧
var JBHeatmap;
var JBEntity = [];
// 运动健身
var YDJSHeatmap;
var YDJSEntity = [];
//咖啡馆
var KFGHeatmap;
var KFGEntity = [];
//水果生鲜
var SGHeatmap;
var SGEntity = [];
//地铁
var DTHeatmap;
var DTEntity = [];
//公交
var GJHeatmap;
var GJEntity = [];
//超市
var CSHeatmap;
var CSEntity = [];
//药店
var YDHeatmap;
var YDEntity = [];
//社区服务
var SQFWHeatmap;
var SQFWEntity = [];

var districtAll = "";

var entityCollection = {};

var viewer;
var previousHeight = 0;

var districtInfoName = "";

$(function () {

    if (!sessionStorage['user']) {
        window.location.href = "login.html";
    }

    if (sessionStorage['role'] == 'district') {
        $('.indexBarItem[value=district]').text(sessionStorage['roleDetail'])
    }

    if (sessionStorage['role'] !== 'admin') {
        $('#ht').remove();
    }
    $('#ht').on('click', function () {
        window.location.href = "data.html";
    })

    $('#indexBar div').on('click', function () {
        var oV = $('#indexBar div.selected').attr('value');
        var nV = $(this).attr('value');
        if (nV !== oV) {
            $(this).siblings().removeClass('selected');
            $(this).addClass('selected');
            for (var i in districtEntity) {
                for (var n in districtEntity[i]) {
                    viewer.entities.getById(districtEntity[i][n]).show = false;
                }
            }
            hideBD();
            viewer.entities.getById(SHIconID).show = false;
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
            $('#ToolBar').empty();
            $('#ToolBar').hide();
            pkBD = [];
            chartsCityHide();
            SHCharts.hide();
            DistrictCharts.hide();
            BDCharts.hide();
            POI.hidePOI();
            BDCompare.hide();
            clearPoi();
            highlightDistrictEnable = false;
            ClickDistrictEnable = false;
            ClickBDEnable = false;
            highlightBDEnbale = false;
            ClickCityEnable = false;
            pkEnable = false;
            drawCircleEnable = false;
            drawPolygonEnable = false;
            $('#PKBDSelect').hide();
            if (nV == 'city') {
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(118.354, 28.708, 7000000),
                    duration: 5,
                });
                setTimeout(function () {
                    onWheel();
                    chartsCity();
                    viewer.entities.getById(SHIconID).show = true;
                }, 4000);
            } else if (nV == 'sh') {
                highlightDistrictEnable = true;
                var e = shEnveloped.geometry.coordinates[0];
                viewer.camera.flyTo({
                    destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
                    duration: 3,
                });
                setTimeout(function () {
                    onWheel();
                    SHCharts.create();
                }, 3000);
            } else if (nV == 'district') {
                ClickBDEnable = true;
                highlightBDEnbale = true;
                if (sessionStorage['role'] == 'district') {
                    DistrictCharts.toolbar();
                    setTimeout(function () {
                        onWheel();
                        var year = $('#ToolBar #year').val();
                        var month = $('#ToolBar #month').val();
                        var time = year + '/' + month + '/1';
                        DistrictCharts.create(sessionStorage['roleDetail'], time);
                    }, 3000);
                } else {
                    highlightDistrictEnable = true;
                    ClickDistrictEnable = true;
                    var e = shEnveloped.geometry.coordinates[0];
                    viewer.camera.flyTo({
                        destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
                        duration: 3,
                    });
                    DistrictCharts.toolbar();
                    setTimeout(function () {
                        onWheel();
                        for (var i in districtEntity['黄浦区']) {
                            viewer.entities.getById(districtEntity['黄浦区'][i]).show = true;
                        }
                    }, 3000);
                }
            } else if (nV == 'bd') {
                zoomFunction()
                setTimeout(function () {
                    BDCharts.toolBar();
                    highlightDistrictEnable = true;
                    highlightBDEnbale = true;
                    ClickBDEnable = true;
                }, 3000);
            } else if (nV == 'poi') {
                //drawCircleEnable = true;
                drawPolygonEnable = true;
                POI.POIToolBar();
                zoomFunction()
            } else if (nV == 'pk') {
                BDCompare.init();
                highlightDistrictEnable = true;
                pkEnable = true;
                highlightBDEnbale = true;
                zoomFunction()
            }
        }
    })

    $('#POIControl .POIItem').on('click', function () {
        var show = true;
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected')
            $(this).find('.POIItemSelect').hide();
            show = false;
        } else {
            $(this).addClass('selected');
            $(this).find('.POIItemSelect').show();
        }
        var v = $(this).attr('value');
        var scene = viewer.scene;
        var ellipsoid = scene.globe.ellipsoid;
        var height = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
        if (height > 22085.139543417274) {
            if (v == '酒吧') {
                JBHeatmap._layer.show = show;
            } else if (v == '便利店') {
                BLDHeatmap._layer.show = show;
            } else if (v == '咖啡馆') {
                KFGHeatmap._layer.show = show;
            } else if (v == '运动健身') {
                YDJSHeatmap._layer.show = show;
            } else if (v == '水果生鲜') {
                SGHeatmap._layer.show = show;
            } else if (v == '地铁') {
                DTHeatmap._layer.show = show;
            } else if (v == '公交') {
                GJHeatmap._layer.show = show;
            } else if (v == '超市') {
                CSHeatmap._layer.show = show;
            } else if (v == '药店') {
                YDHeatmap._layer.show = show;
            } else if (v == '社区服务') {
                SQFWHeatmap._layer.show = show;
            }
        } else {
            if (v == '酒吧') {
                for (var i in JBEntity) {
                    viewer.entities.getById(JBEntity[i]).show = show;
                }
            } else if (v == '便利店') {
                for (var i in BLDEntity) {
                    viewer.entities.getById(BLDEntity[i]).show = show;
                }
            } else if (v == '咖啡馆') {
                for (var i in KFGEntity) {
                    viewer.entities.getById(KFGEntity[i]).show = show;
                }
            } else if (v == '运动健身') {
                for (var i in YDJSEntity) {
                    viewer.entities.getById(YDJSEntity[i]).show = show;
                }
            } else if (v == '水果生鲜') {
                for (var i in SGEntity) {
                    viewer.entities.getById(SGEntity[i]).show = show;
                }
            } else if (v == '地铁') {
                for (var i in DTEntity) {
                    viewer.entities.getById(DTEntity[i]).show = show;
                }
            } else if (v == '公交') {
                for (var i in GJEntity) {
                    viewer.entities.getById(GJEntity[i]).show = show;
                }
            } else if (v == '超市') {
                for (var i in CSEntity) {
                    viewer.entities.getById(CSEntity[i]).show = show;
                }
            } else if (v == '药店') {
                for (var i in YDEntity) {
                    viewer.entities.getById(YDEntity[i]).show = show;
                }
            } else if (v == '社区服务') {
                for (var i in SQFWEntity) {
                    viewer.entities.getById(SQFWEntity[i]).show = show;
                }
            }
        }
    })

    $("#cesiumContainer").css('height', $(window).height());
    viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
            url: 'http://www.google.cn/maps/vt?lyrs=s&gl=cn&x={x}&y={y}&z={z}',
            credit: '',
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18,
        }),
        terrainExaggeration: 1,
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        navigationHelpButton: false,
        timeline: false,
        selectionIndicator: false,
        sceneModePicker: false,
        homeButton: false,
        vrButton: false,
        geocoder: false,
        automaticallyTrackDataSourceClocks: false,
        navigationInstructionsInitiallyVisible: false
    });

    var shIcon = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(121.60188064057911, 31.2016743620822),
        label: {
            text: '上海',
            font: '220px Microsoft YaHei bold',
            scale: 0.1,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            showBackground: true,
            backgroundPadding: new Cesium.Cartesian2(150, 50),
            pixelOffset: new Cesium.Cartesian2(50, 0),
        },
        show: false
    })
    SHIconID = shIcon.id;

    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.globe.enableLighting = false;
    viewer.scene.skyAtmosphere.brightnessShift = 0;
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('rgb(14,29,40)');

    var imageryLayers = viewer.imageryLayers;
    baseLayerList.satellite = imageryLayers._layers[0];
    baseLayerList.satellite.show = true;

    baseLayerList.dark = viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        //url: 'http://192.168.1.22:8888/arcgis/rest/services/TileMap/MapServer/tile/{z}/{y}/{x}'
    }))

    baseLayerList.custom = viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'
        //url: 'http://172.20.10.8:8888/arcgis/rest/services/TileMap1/MapServer/tile/{z}/{y}/{x}'
    }))

    // baseLayerList.custom = viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
    //     url: 'http://47.103.83.153:8081/geoserver/fdsq/wms',
    //     layers: 'fdsq:fdsqLayerGroup',
    //     parameters: {
    //         service: 'WMS',
    //         format: 'image/png',
    //         transparent: true,
    //     }
    // }));

    // baseLayerList.custom = viewer.imageryLayers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
    //     url: 'http://172.20.10.8:6080/arcgis/rest/services/DynamicMap/MapServer'
    //     //url: 'http://1172.20.10.8:8888/arcgis/rest/services/TileMap/MapServer'
    // }));
    baseLayerList.dark.show = false;
    baseLayerList.custom.show = false;
    baseLayerList.dark.brightness = 3;
    baseLayerList.dark.contrast = 1.08;
    baseLayerList.dark.hue = 0.06;
    baseLayerList.dark.saturation = 0.6;
    baseLayerList.dark.gamma = 0.54;

    baseLayerList.custom.brightness = 3;
    baseLayerList.custom.contrast = 1.08;
    baseLayerList.custom.hue = 0.06;
    baseLayerList.custom.saturation = 0.6;
    baseLayerList.custom.gamma = 0.54;

    baseLayerList.satellite.show = true;
    baseLayerList.dark.show = false;
    baseLayerList.custom.show = false;

    viewer.screenSpaceEventHandler.setInputAction(onWheel, Cesium.ScreenSpaceEventType.WHEEL);

    $(document).mousemove(function (e) {
        if (e.pageX < 90) {
            $('#indexBar').css({
                left: "0px"
            });
            $('.leftCharts').css({
                left: "95px"
            });
            $('#BDCharts7,#CompareCharts7,#ToolBar').css({
                left: $(document).width() * 0.26 + 90,
                width: $(document).width() * 0.48 - 90
            });
            if ($('#BDCharts7').css('display') == 'block') {
                echarts.getInstanceByDom(document.getElementById('BDCharts7')).resize();
                $('#BDCharts7Back').css('left', $('#BDCharts1').width() + 100)
            }
            if ($('#CompareCharts7').css('display') == 'block') {
                echarts.getInstanceByDom(document.getElementById('CompareCharts7')).resize();
                $('#CompareCharts7Back').css('left', $('#CompareCharts1').width() + 100)
            }
        } else {
            $('#indexBar').css({
                left: "-90px"
            });
            $('.leftCharts').css({
                left: "0px"
            });
            $('#BDCharts7,#CompareCharts7,#ToolBar').css({
                left: $(document).width() * 0.26,
                width: $(document).width() * 0.48
            });
            if ($('#BDCharts7').css('display') == 'block') {
                echarts.getInstanceByDom(document.getElementById('BDCharts7')).resize();
                $('#BDCharts7Back').css('left', $('#BDCharts1').width() + 5)
            }
            if ($('#CompareCharts7').css('display') == 'block') {
                echarts.getInstanceByDom(document.getElementById('CompareCharts7')).resize();
                $('#CompareCharts7Back').css('left', $('#CompareCharts1').width() + 5)
            }
        }
    })
    drawBD();
    POI.drawPOI();

    $.getJSON('data/上海区县_GCJ02.json', function (json) {
        districtJson = json;
        for (var i in json.features) {
            var f = json.features[i];
            if (f.properties.NAME) {
                var oHtml = "<div class='customOption' value='" + f.properties.NAME + "'>" + f.properties.NAME + "</div>"
                $("#BDDistrict .customSelectOption").append(oHtml);
                districtEntity[f.properties.NAME] = [];
                if (f.geometry.coordinates.length == 1) {
                    var hie = [];
                    for (var x in f.geometry.coordinates[0]) {
                        hie.push(f.geometry.coordinates[0][x][0])
                        hie.push(f.geometry.coordinates[0][x][1])
                    }
                    var a = viewer.entities.add({
                        name: 'District',
                        qxname: f.properties.NAME,
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(hie),
                            material: Cesium.Color.fromCssColorString('rgba(74,160,229,0.2)'),
                            outline: false,
                        },
                        show: false
                    });
                    var b = viewer.entities.add({
                        name: 'District',
                        qxname: f.properties.NAME,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray(hie),
                            width: 1,
                            arcType: Cesium.ArcType.RHUMB,
                            material: Cesium.Color.WHITE
                        },
                        show: true
                    });
                    districtEntity[f.properties.NAME].push(a.id);
                    //districtEntity[f.properties.NAME].push(b.id);
                } else {
                    for (var y in f.geometry.coordinates) {
                        var hie = [];
                        for (var x in f.geometry.coordinates[y][0]) {
                            hie.push(f.geometry.coordinates[y][0][x][0])
                            hie.push(f.geometry.coordinates[y][0][x][1])
                        }
                        var a = viewer.entities.add({
                            name: 'District',
                            qxname: f.properties.NAME,
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArray(hie),
                                material: Cesium.Color.fromCssColorString('rgba(74,160,229,0.2)'),
                                outline: false,
                            },
                            show: false
                        });
                        var b = viewer.entities.add({
                            name: 'District',
                            qxname: f.properties.NAME,
                            polyline: {
                                positions: Cesium.Cartesian3.fromDegreesArray(hie),
                                width: 1,
                                arcType: Cesium.ArcType.RHUMB,
                                material: Cesium.Color.WHITE
                            },
                            show: true
                        });
                        districtEntity[f.properties.NAME].push(a.id);
                        //districtEntity[f.properties.NAME].push(b.id);
                    }
                }

                districtPolygon[f.properties.NAME] = f.geometry.coordinates;
            }
            if ((sessionStorage['roleDetail'] == f.properties.NAME && sessionStorage['role'] == 'district') || (sessionStorage['roleDetail'] == "")) {
                var html = "<div class='POIItem' value='" + f.properties.NAME + "'><div class='POIItemText'>" + f.properties.NAME + "</div><div class='POIItemSelect'></div><div class='BDContainer charts'>test</div></div>";
                $('#PKBDSelect').append(html)
            }
        };
        for (var i in districtPoint.features) {
            var p = districtPoint.features[i];
            var a = viewer.entities.add({
                name: 'District',
                qxname: p.properties.QX.replace('县', '区'),
                position: Cesium.Cartesian3.fromDegrees(p.geometry.coordinates[0], p.geometry.coordinates[1]),
                label: {
                    text: p.properties.QX.replace('县', '区'),
                    font: '220px Microsoft YaHei bold',
                    scale: 0.1,
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    showBackground: true,
                    backgroundPadding: new Cesium.Cartesian2(150, 50),
                },
                show: false
            });
            districtEntity[p.properties.QX].push(a.id);
        }
    })

    viewer.screenSpaceEventHandler.setInputAction(mapMouseMoveEvent, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewer.screenSpaceEventHandler.setInputAction(mapLeftClickEvent, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewer.screenSpaceEventHandler.setInputAction(mapRightClickEvent, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    viewer.screenSpaceEventHandler.setInputAction(mapLeftDoubleClickEvent, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    initArcGISMap();

    // $('.charts').on('click', function () {
    //     var inst = echarts.getInstanceByDom(document.getElementById($(this).attr('id')));
    //     $('body').append("<div id='fullScreenCharts'></div>")
    //     var option = inst.getOption();
    //     var ec = echarts.init(document.getElementById('fullScreenCharts'));
    //     ec.setOption(option);
    //     $('#fullScreenCharts').on('click', function () {
    //         $('#fullScreenCharts').remove();
    //     })
    // })

    //POI.create('121.54420117267783,31.279649215061767', 518.4357703678259, '2019-03-11');
    // pkBD = [{
    //     BDName: '南京路步行街西段街道'
    // }, {
    //     BDName: '陆家嘴街道'
    // }]
    // BDCompare.create();
    //BDCharts.create('徐家汇街道')

    //DistrictCharts.create('黄浦区', '2019/3/1')
    //SHCharts.create();
    //return
})

function checkPointinDistrict(point) {
    var d = "";
    var pt = turf.point(point);
    for (var i in districtPolygon) {
        if (districtPolygon[i].length == 1) {
            var poly = turf.polygon(districtPolygon[i]);
            if (turf.booleanPointInPolygon(pt, poly)) {
                d = i;
                return d;
            }
        } else {
            for (var x in districtPolygon[i]) {
                var c = districtPolygon[i][x]
                var poly = turf.polygon(districtPolygon[i][x]);
                if (turf.booleanPointInPolygon(pt, poly)) {
                    d = i;
                    return d;
                }
            }
        }

    }
    return d;
}

function chartsCity() {
    ClickCityEnable = true;
    $('#cityChartsBack').show();
    $('#cityCharts2Title').css('top', $('body').height() * 0.75 - 30)
    $('.cityChartsTitle').show();
    $('#cityChartsChange').show();
    $('#cityChartsChange').css('left', $('body').width() * 0.75 + 130 + 15);
    $('#cityChartsYear').empty();
    $('#cityChartsMonth').empty();
    $('#cityChartsYear').show();
    $('#cityChartsMonth').show();
    $('#cityChartsYear').css('left', $('body').width() * 0.75 + 130 + 120 + 15);
    $('#cityChartsMonth').css('left', $('body').width() * 0.75 + 130 + 120 + 90 + 15);
    $('#cityCharts1').show();
    // $('#cityCharts2').show();

    $.ajax({
        cache: false,
        type: "Get",
        url: encodeURI(serviceHost + "GetDistinctTime?type=year&data=城市间", "UTF-8"),
        dataType: "json",
        success: function (response) {
            response = eval('(' + response + ')');
            if (response.result == 'ok') {
                var data = eval('(' + response.data + ')');
                for (var i in data) {
                    var html = "<option value='" + data[i].Time + "'>" + data[i].Time + "年</option>";
                    $('#cityChartsYear').append(html);
                }
                $('#cityChartsYear').on('change', function () {
                    var v = $('#cityChartsYear').val();
                    $('#cityChartsMonth').empty();
                    $.ajax({
                        cache: false,
                        type: "Get",
                        url: encodeURI(serviceHost + "GetDistinctTime?type=month&data=城市间&para=" + v, "UTF-8"),
                        dataType: "json",
                        success: function (response) {
                            response = eval('(' + response + ')');
                            if (response.result == 'ok') {
                                var data = eval('(' + response.data + ')');
                                for (var i in data) {
                                    var html = "<option value='" + data[i].Time + "'>" + data[i].Time + "月</option>";
                                    $('#cityChartsMonth').append(html);
                                }
                                $('#cityChartsMonth').off('change');
                                $('#cityChartsMonth').on('change', function () {
                                    var y = $('#cityChartsYear').val();
                                    var m = $('#cityChartsMonth').val();
                                    var ele = $('#cityChartsChange span.selected');
                                    $(ele).removeClass('selected');
                                    $(ele).siblings().addClass('selected');
                                    var url = serviceHost + "GetYDXFData?time=" + y + "-" + m + "-01";
                                    $.ajax({
                                        cache: false,
                                        type: "Get",
                                        url: encodeURI(url, "UTF-8"),
                                        dataType: "json",
                                        success: function (response) {
                                            var data = eval('(' + response + ')');
                                            //console.log(data)
                                            $('#cityChartsChange span').off('click');
                                            $('#cityChartsChange span').on('click', function () {
                                                var oV = $('#cityChartsChange span.selected').attr('value');
                                                var nV = $(this).attr('value');
                                                if (nV !== oV) {
                                                    removeFlyLine();
                                                    $(this).siblings().removeClass('selected');
                                                    $(this).addClass('selected');
                                                    var table = data[nV];
                                                    var xseMax = 0;
                                                    for (var i in table) {
                                                        var a = viewer.entities.add({
                                                            Name: 'City',
                                                            CityName: table[i].Name,
                                                            position: Cesium.Cartesian3.fromDegrees(table[i].Longitude, table[i].Latitude),
                                                            billboard: {
                                                                image: 'img/guangyun.png',
                                                                show: true,
                                                                scale: 0.618,
                                                            },
                                                            label: {
                                                                text: table[i].Name,
                                                                font: '160px Microsoft YaHei bold',
                                                                scale: 0.1,
                                                                showBackground: true,
                                                                backgroundPadding: new Cesium.Cartesian2(150, 50),
                                                                fillColor: Cesium.Color.WHITE,
                                                                outlineColor: Cesium.Color.BLACK,
                                                                outlineWidth: 1,
                                                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                                                pixelOffset: new Cesium.Cartesian2(0, 20),
                                                                show: true,
                                                            },
                                                            show: false
                                                        });
                                                        flylineIconEntity.push(a.id);
                                                        var sum = Number(table[i].Sum.toFixed(2));
                                                        if (sum > xseMax) {
                                                            xseMax = sum;
                                                        }
                                                    }

                                                    var eCharts1 = echarts.init(document.getElementById('cityCharts1'));
                                                    option1 = {
                                                        grid: {
                                                            left: '15%',
                                                            bottom: '5%',
                                                            right: '30%'
                                                        },
                                                        tooltip: {
                                                            trigger: 'item',
                                                            axisPointer: {
                                                                type: 'cross',
                                                                crossStyle: {
                                                                    color: 'rgba(0,0,0,0)'
                                                                },
                                                            },
                                                            formatter: '{a}: {c}%'
                                                        },
                                                        legend: {
                                                            data: ['金额'],
                                                            textStyle: {
                                                                color: '#fff'
                                                            }
                                                        },
                                                        yAxis: [{
                                                            type: 'category',
                                                            inverse: true,
                                                            data: [],
                                                            axisPointer: {
                                                                type: 'shadow'
                                                            },
                                                            axisLabel: {
                                                                interval: 0,
                                                                color: '#fff',
                                                            },
                                                            axisLine: {
                                                                show: false
                                                            },
                                                            splitLine: {
                                                                show: false
                                                            }
                                                        }],
                                                        xAxis: [{
                                                            type: 'value',
                                                            axisLine: {
                                                                show: false
                                                            },
                                                            axisLabel: {
                                                                show: false
                                                            },
                                                            splitLine: {
                                                                show: false
                                                            },
                                                            max: xseMax,
                                                        }],
                                                        //series: ydxfSeries
                                                        series: [{
                                                                name: 'shadow',
                                                                type: 'bar',
                                                                data: [],
                                                                itemStyle: {
                                                                    color: 'rgb(255,255,255,0.1)',
                                                                },
                                                                barGap: '-100%',
                                                                barWidth: $('body').height() * 0.03,
                                                                animation: true,
                                                            },
                                                            {
                                                                name: '人口占比',
                                                                type: 'bar',
                                                                data: [],
                                                                barWidth: $('body').height() * 0.03,
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
                                                                },
                                                                label: {
                                                                    show: true,
                                                                    position: 'right',
                                                                    formatter: '{c}%',
                                                                    color: '#fff'
                                                                }
                                                            }
                                                        ]
                                                    };
                                                    eCharts1.setOption(option1);

                                                    var eCharts2 = echarts.init(document.getElementById('cityCharts2'));
                                                    option2 = {
                                                        tooltip: {
                                                            trigger: 'item',
                                                            formatter: "{b} : {d} %"
                                                        },
                                                        legend: {
                                                            data: [],
                                                            right: '15%',
                                                            top: '15%',
                                                            orient: 'vertical',
                                                            textStyle: {
                                                                color: '#fff'
                                                            }
                                                        },
                                                        color: ['#8378EA', '#D3BCEA', '#FB7293', '#FF9F7F', '#FFDB5C', '#9FE6B8', '#32C5FD', '#37A2DA', '#FF944D', 'rgb(203,236,88)', '#CBEC58', '#D565F4', '#5CFDFF', '#1DE6A6'],
                                                        series: [{
                                                            type: 'pie',
                                                            radius: ['20%', '75%'],
                                                            center: ['30%', '50%'],
                                                            data: [],
                                                            //roseType: 'radius',
                                                            label: {
                                                                show: true,
                                                                fontWeight: '800',
                                                                formatter: function (para) {
                                                                    return para.percent.toFixed(1) + "%"
                                                                }
                                                            },
                                                            labelLine: {
                                                                show: true,
                                                                length: 5,
                                                                length2: 0,
                                                                lineStyle: {
                                                                    color: 'rgba(0,0,0,0)'
                                                                }
                                                            },
                                                            animationType: 'scale',
                                                            animationEasing: 'elasticOut',
                                                        }]
                                                    };
                                                    eCharts2.setOption(option2);

                                                    var cata = [];
                                                    var xse = [];
                                                    var xseShadow = [];

                                                    var index = 0;
                                                    var a = setInterval(function () {
                                                        viewer.entities.getById(flylineIconEntity[index]).show = true;
                                                        var city = table[index].Name;
                                                        city = city.replace('市', '');
                                                        cata.push(city);
                                                        var sum = Number(table[index].Sum.toFixed(2));
                                                        xse.push(sum)
                                                        xseShadow.push(xseMax * 1.2);
                                                        var option = {
                                                            yAxis: [{
                                                                data: cata,
                                                            }],
                                                            series: [{
                                                                    data: xseShadow,
                                                                },
                                                                {
                                                                    data: xse,
                                                                }
                                                            ]
                                                        };
                                                        eCharts1.setOption(option);
                                                        if (index == 3) {
                                                            clearInterval(a);
                                                            for (var i = 4; i < table.length; i++) {
                                                                viewer.entities.getById(flylineIconEntity[i]).show = true;
                                                                var city = table[i].Name;
                                                                city = city.replace('市', '');
                                                                cata.push(city);
                                                                var sum = Number(table[i].Sum.toFixed(2));
                                                                xse.push(sum)
                                                                xseShadow.push(xseMax * 1.2);
                                                            }
                                                            var option = {
                                                                yAxis: [{
                                                                    data: cata,
                                                                }],
                                                                series: [{
                                                                        data: xseShadow,
                                                                    },
                                                                    {
                                                                        data: xse,
                                                                    }
                                                                ]
                                                            };
                                                            eCharts1.setOption(option);
                                                            if (nV == 'In') {
                                                                createFlyLine('#40e2ff', table, nV);
                                                            } else {
                                                                createFlyLine('#ffb526', table, nV);
                                                            }
                                                            var iCata = [];
                                                            var iXse = [];
                                                            for (var i in data[nV + "Industry"]) {
                                                                iCata.push(data[nV + "Industry"][i].Industry)
                                                                iXse.push({
                                                                    value: Number(data[nV + "Industry"][i].Sum).toFixed(2),
                                                                    name: data[nV + "Industry"][i].Industry
                                                                })
                                                            }
                                                            var option2 = {
                                                                legend: {
                                                                    data: iCata,
                                                                },
                                                                series: [{
                                                                    data: iXse,
                                                                }]
                                                            };
                                                            eCharts2.setOption(option2);
                                                        }
                                                        index++;
                                                    }, 1000)
                                                }
                                            })
                                            if ($('#cityChartsChange span.selected').length == 0) {
                                                $('#cityChartsChange span:first').click();
                                            } else {
                                                $('#cityChartsChange span.selected').siblings().click();
                                            }
                                        }
                                    })
                                })
                                $('#cityChartsMonth').trigger('change');
                            }
                        }
                    })
                })
                $('#cityChartsYear').trigger('change');
            }
        }
    })
}

function chartsCityHide() {
    $('#cityChartsBack').hide();
    $('.cityChartsTitle').hide();
    $('#cityChartsChange').hide();
    $('#cityChartsYear').hide();
    $('#cityChartsMonth').hide();
    $('#cityCharts1').hide();
    $('#cityCharts2').hide();
    removeFlyLine();
    var ele = $('#cityChartsChange span.selected');
    $(ele).removeClass('selected');
    $(ele).siblings().addClass('selected');
}

function drawBD() {
    $.getJSON('data/BD_Disslove.json', function (json) {
        for (var i in json.features) {
            var f = json.features[i];
            if (f.properties.name) {
                BDArea[f.properties.name] = [];
                BDAreaPolygon[f.properties.name] = f;
                if (f.geometry.coordinates.length == 1) {
                    var hie = [];
                    for (var x in f.geometry.coordinates[0]) {
                        hie.push(f.geometry.coordinates[0][x][0])
                        hie.push(f.geometry.coordinates[0][x][1])
                    }
                    if (f.properties.name !== '徐家汇街道' && f.properties.name !== '中山公园街道') {
                        var a = viewer.entities.add({
                            name: 'BDArea',
                            bdname: f.properties.name,
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArray(hie),
                                material: Cesium.Color.fromCssColorString('rgba(255,215,0,0.2)'),
                                outline: false,
                            },
                            show: false
                        });
                        BDArea[f.properties.name].push(a.id);
                    }
                    var b = viewer.entities.add({
                        name: 'BDArea',
                        bdname: f.properties.name,
                        polyline: {
                            positions: Cesium.Cartesian3.fromDegreesArray(hie),
                            width: 2,
                            arcType: Cesium.ArcType.RHUMB,
                            material: Cesium.Color.fromCssColorString('rgba(255,215,0,0.8)'),
                        },
                        show: false
                    });
                    BDArea[f.properties.name].push(b.id);
                } else {
                    for (var y in f.geometry.coordinates) {
                        var hie = [];
                        for (var x in f.geometry.coordinates[y][0]) {
                            hie.push(f.geometry.coordinates[y][0][x][0])
                            hie.push(f.geometry.coordinates[y][0][x][1])
                        }
                        var a = viewer.entities.add({
                            name: 'District',
                            qxname: f.properties.NAME,
                            polygon: {
                                hierarchy: Cesium.Cartesian3.fromDegreesArray(hie),
                                material: Cesium.Color.fromCssColorString('rgba(255,215,0,0.2)'),
                                outline: false,
                            },
                            show: false
                        });
                        var b = viewer.entities.add({
                            name: 'District',
                            qxname: f.properties.NAME,
                            polyline: {
                                positions: Cesium.Cartesian3.fromDegreesArray(hie),
                                width: 2,
                                arcType: Cesium.ArcType.RHUMB,
                                material: Cesium.Color.fromCssColorString('rgba(255,215,0,0.8)'),
                            },
                            show: false
                        });
                        BDArea[f.properties.name].push(a.id);
                        BDArea[f.properties.name].push(b.id);
                    }
                }
            }
        };
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
                    var centroid = turf.point([bd.Sub[0].Lon, bd.Sub[0].Lat]);
                    centroid.properties.Name = bd.Name;
                    centroid.properties.District = bd.District;
                    BDCenter.push(centroid);
                    if (bd.Class == '市级街道') {
                        var a = viewer.entities.add({
                            name: 'BD',
                            BDName: bd.Name,
                            BDType: bd.Class,
                            BDDistrict: bd.Sub[0].District,
                            position: Cesium.Cartesian3.fromDegrees(centroid.geometry.coordinates[0], centroid.geometry.coordinates[1], 0),
                            billboard: {
                                image: 'img/shangquan_big.png',
                                show: true,
                            },
                            label: {
                                text: bd.Name,
                                font: '180px Microsoft YaHei bold',
                                scale: 0.1,
                                showBackground: true,
                                backgroundPadding: new Cesium.Cartesian2(150, 50),
                                fillColor: Cesium.Color.WHITE,
                                outlineColor: Cesium.Color.BLACK,
                                outlineWidth: 1,
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                pixelOffset: new Cesium.Cartesian2(0, 28),
                                show: false,
                            },
                            show: false
                        });
                        BDClass1Entity.push(a.id);
                    } else {
                        var a = viewer.entities.add({
                            name: 'BD',
                            BDName: bd.Name,
                            BDType: bd.Class,
                            BDDistrict: bd.Sub[0].District,
                            position: Cesium.Cartesian3.fromDegrees(centroid.geometry.coordinates[0], centroid.geometry.coordinates[1]),
                            billboard: {
                                image: 'img/shangquan_small.png',
                                show: true,
                            },
                            label: {
                                text: bd.Name,
                                font: '160px Microsoft YaHei bold',
                                scale: 0.1,
                                showBackground: true,
                                backgroundPadding: new Cesium.Cartesian2(100, 25),
                                fillColor: Cesium.Color.WHITE,
                                outlineColor: Cesium.Color.BLACK,
                                outlineWidth: 1,
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                pixelOffset: new Cesium.Cartesian2(0, 16),
                                show: false,
                            },
                            show: false
                        });
                        BDClass2Entity.push(a.id);
                    }
                }
            }
        })
    })
}

function getTopBD() {
    var year = $('#ToolBar #year').val();
    var month = $('#ToolBar #month').val();
    if (!year) {
        year = new Date().getFullYear();
        month = Number(new Date().getMonth()) + 1
        month = 3;
    }
    var time = year + '/' + month + '/1';
    var url = serviceHost + "GetBDRankTop?min=2&time=" + time;
    $.ajax({
        cache: false,
        type: "Get",
        url: encodeURI(url, "UTF-8"),
        dataType: "json",
        success: function (response) {
            response = eval('(' + response + ')');
            //console.log(response)
            if (response.result == 'ok') {
                var data = eval('(' + response.data + ')');
                bdtop2list = [];
                for (var x in data) {
                    for (var i in BDClass1Entity) {
                        var a = viewer.entities.getById(BDClass1Entity[i]);
                        if (a.BDName == data[x]) {
                            bdtop2list.push(BDClass1Entity[i])
                        }
                    }
                    for (var i in BDClass2Entity) {
                        var a = viewer.entities.getById(BDClass2Entity[i]);
                        if (a.BDName == data[x]) {
                            bdtop2list.push(BDClass2Entity[i])
                        }
                    }
                }
                for (var i in bdtop2list) {
                    viewer.entities.getById(bdtop2list[i]).show = true;
                }
            }
        }
    })
}

function showBD(type) {
    if (type == 'all') {
        for (var i in BDClass1Entity) {
            viewer.entities.getById(BDClass1Entity[i]).show = true;
        }
        for (var i in BDClass2Entity) {
            viewer.entities.getById(BDClass2Entity[i]).show = true;
        }
    } else if (type == 'top') {
        for (var i in BDClass1Entity) {
            viewer.entities.getById(BDClass1Entity[i]).show = false;
        }
        for (var i in BDClass2Entity) {
            viewer.entities.getById(BDClass2Entity[i]).show = false;
        }
        for (var i in bdtop2list) {
            viewer.entities.getById(bdtop2list[i]).show = true;
        }
    } else {
        for (var i in BDClass1Entity) {
            if (viewer.entities.getById(BDClass1Entity[i]).BDDistrict == type) {
                viewer.entities.getById(BDClass1Entity[i]).show = true;
            }
        }
        for (var i in BDClass2Entity) {
            if (viewer.entities.getById(BDClass2Entity[i]).BDDistrict == type) {
                viewer.entities.getById(BDClass2Entity[i]).show = true;
            }
        }
    }
}

function hideBD() {
    for (var i in BDClass1Entity) {
        viewer.entities.getById(BDClass1Entity[i]).show = false;
    }
    for (var i in BDClass2Entity) {
        viewer.entities.getById(BDClass2Entity[i]).show = false;
    }
}

//生成抛物线
function parabolaEquation(options, resultOut) {
    //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
    var h = options.height && options.height > 5000 ? options.height : 5000;
    var L = Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat) ? Math.abs(options.pt1.lon - options.pt2.lon) : Math.abs(options.pt1.lat - options.pt2.lat);
    var num = options.num && options.num > 50 ? options.num : 50;
    var result = [];
    var dlt = L / num;
    if (Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat)) { //以lon为基准
        var delLat = (options.pt2.lat - options.pt1.lat) / num;
        if (options.pt1.lon - options.pt2.lon > 0) {
            dlt = -dlt;
        }
        for (var i = 0; i < num; i++) {
            var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
            var lon = options.pt1.lon + dlt * i;
            var lat = options.pt1.lat + delLat * i;
            result.push([lon, lat, tempH]);
        }
    } else { //以lat为基准
        var delLon = (options.pt2.lon - options.pt1.lon) / num;
        if (options.pt1.lat - options.pt2.lat > 0) {
            dlt = -dlt;
        }
        for (var i = 0; i < num; i++) {
            var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
            var lon = options.pt1.lon + delLon * i;
            var lat = options.pt1.lat + dlt * i;
            result.push([lon, lat, tempH]);
        }
    }
    if (resultOut != undefined) {
        resultOut = result;
    }
    return result;
}

function createFlyLine(colorString, data, InOut) {
    /*
          流纹纹理线
          color 颜色
          duration 持续时间 毫秒
       */
    function PolylineTrailLinkMaterialProperty(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = (new Date()).getTime();
    }
    Cesium.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color')
    });
    PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
        return 'PolylineTrailLink';
    }
    PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.image = Cesium.Material.PolylineTrailLinkImage;
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
        return result;
    }
    PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
        return this === other ||
            (other instanceof PolylineTrailLinkMaterialProperty &&
                Property.equals(this._color, other._color))
    }
    Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
    Cesium.Material.PolylineTrailLinkImage = "img/cjzsbj1.png";
    Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                  {\n\
                                                       czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                       vec2 st = materialInput.st;\n\
                                                       vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                       material.alpha = colorImage.a * color.a;\n\
                                                       material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                       return material;\n\
                                                   }";
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
        fabric: {
            type: Cesium.Material.PolylineTrailLinkType,
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: Cesium.Material.PolylineTrailLinkImage,
                time: 0
            },
            source: Cesium.Material.PolylineTrailLinkSource
        },
        translucent: function (material) {
            return true;
        }
    });

    function PolylineTrailLinkMaterialProperty1(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = (new Date()).getTime();
    }
    Cesium.defineProperties(PolylineTrailLinkMaterialProperty1.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color')
    });
    PolylineTrailLinkMaterialProperty1.prototype.getType = function (time) {
        return 'PolylineTrailLink';
    }
    PolylineTrailLinkMaterialProperty1.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.image = Cesium.Material.PolylineTrailLinkImage;
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
        return result;
    }
    PolylineTrailLinkMaterialProperty1.prototype.equals = function (other) {
        return this === other ||
            (other instanceof PolylineTrailLinkMaterialProperty1 &&
                Property.equals(this._color, other._color))
    }
    Cesium.PolylineTrailLinkMaterialProperty1 = PolylineTrailLinkMaterialProperty1;
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
    Cesium.Material.PolylineTrailLinkImage = "img/cjzsbj1.png";
    Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                  {\n\
                                                       czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                       vec2 st = materialInput.st;\n\
                                                       vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                       material.alpha = colorImage.a * color.a;\n\
                                                       material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                       return material;\n\
                                                   }";
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
        fabric: {
            type: Cesium.Material.PolylineTrailLinkType,
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: Cesium.Material.PolylineTrailLinkImage,
                time: 0
            },
            source: Cesium.Material.PolylineTrailLinkSource
        },
        translucent: function (material) {
            return true;
        }
    });

    var material1 = new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.fromCssColorString(colorString), 5300);
    var material2 = new Cesium.PolylineTrailLinkMaterialProperty1(Cesium.Color.fromCssColorString(colorString), 12400);
    var center = {
        lon: 121.46947778,
        lat: 31.23194382
    }
    for (var j in data) {
        var d = {
            lon: Number(data[j].Longitude),
            lat: Number(data[j].Latitude),
        }
        if (InOut == 'In') {
            var points = parabolaEquation({
                pt1: d,
                pt2: center,
                height: 150000,
                num: 50
            });
        } else {
            var points = parabolaEquation({
                pt1: center,
                pt2: d,
                height: 150000,
                num: 50
            });
        }
        var pointArr = [];
        for (var i = 0; i < points.length; i++) {
            pointArr.push(points[i][0], points[i][1], points[i][2]);
        }
        var m = j % 2 == 0 ? material1 : material2
        var e = viewer.entities.add({
            name: 'PolylineTrailLink',
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(pointArr),
                width: Math.round(data[j].Sum),
                material: m
            }
        });
        flylineEntity.push(e.id);
    }
}

function removeFlyLine() {
    for (var i in flylineEntity) {
        var entity = viewer.entities.getById(flylineEntity[i])
        entity.show = false;
        viewer.entities.remove(entity)
    }
    flylineEntity = [];
    for (var i in flylineIconEntity) {
        var entity = viewer.entities.getById(flylineIconEntity[i])
        entity.show = false
        viewer.entities.remove(entity)
    }
    flylineIconEntity = []
}

function numberTextFormat(text) {
    var t = "";
    for (var i in text) {
        if ((Number(text.length) - Number(i)) % 3 !== 0) {
            t += text[i];
        } else if (Number(i) == 0) {
            t += text[i];
        } else {
            t += "," + text[i]
        }
    }
    return t
}

function mapLeftClickEvent(movement) {
    if (drawCircleEnable) {
        if (circleCenter.length == 0) {
            var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
            if (cartesian) {
                var ellipsoid = viewer.scene.globe.ellipsoid;
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var lng = Cesium.Math.toDegrees(cartographic.longitude);
                circleCenter = [lng, lat];
            }
        } else if (drawCircle) {
            drawCircleEnable = false;
            POI.create(circleCenter[0] + "," + circleCenter[1], drawCircleRadius, '2019-03-11');
        }
    } else if (drawPolygonEnable) {
        var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
        if (cartesian) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            drawPolygonPoints.push([lng, lat]);
            drawPolygonFunctin(drawPolygonPoints);
        }
    } else {
        for (var i in districtEntity) {
            for (var n in districtEntity[i]) {
                viewer.entities.getById(districtEntity[i][n]).show = false;
            }
        }
        if (ClickDistrictEnable) {
            var pick = viewer.scene.pick(movement.position);
            if (pick && pick.id.name == 'District') {
                var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
                if (cartesian) {
                    var ellipsoid = viewer.scene.globe.ellipsoid;
                    var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                    var lat = Cesium.Math.toDegrees(cartographic.latitude);
                    var lng = Cesium.Math.toDegrees(cartographic.longitude);
                    var d = pick.id.qxname
                    if (d !== "") {
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
                        var year = $('#ToolBar #year').val();
                        var month = $('#ToolBar #month').val();
                        var time = year + '/' + month + '/1';
                        DistrictCharts.create(d, time);
                    } else {
                        DistrictCharts.hide();
                    }
                }
            } else {
                DistrictCharts.hide();
            }
        }
        if (ClickBDEnable) {
            var pick = viewer.scene.pick(movement.position);
            if (pick && pick.id.name == 'BD') {
                if ($('.indexBarItem[value=district]').hasClass('selected')) {
                    $('#ToolBar #bd').val(pick.id.BDName);
                    setTimeout(function () {
                        $('#ToolBar #bd').trigger('change')
                    }, 1000)
                } else {
                    BDCharts.hide();
                    clickBDid = pick.id.id;
                    BDCharts.create(pick.id.BDName);
                }
            } else {
                BDCharts.hide();
            }
        }
        if (pkEnable) {
            var pick = viewer.scene.pick(movement.position);
            if (pick && pick.id.name == 'BD') {
                $('#PKBDSelect .BDItem[value=' + pick.id.BDName + ']').addClass('selected');
                pkBD.push(pick.id);
                viewer.entities.getById(pick.id.id).label.show = true;
                viewer.entities.getById(pick.id.id).billboard.image = "img/shangquan_big_d.png";
                viewer.entities.getById(pick.id.id).label.pixelOffset = new Cesium.Cartesian2(0, 30);
                if (pkBD.length == 2) {
                    BDCompare.create();
                }
            }
        }
        if (ClickCityEnable) {
            var pick = viewer.scene.pick(movement.position);
            var type = $('#cityChartsChange span.selected').attr('value');
            if (pick && pick.id.Name == 'City') {
                var cname = pick.id.CityName;
                var url1 = serviceHost + "GetYDXFPieData?Time=2018-01-01&City=" + cname + "&type=in";
                $.ajax({
                    cache: false,
                    type: "Get",
                    url: encodeURI(url1, "UTF-8"),
                    dataType: "json",
                    success: function (response) {
                        response = eval('(' + response + ')');
                        if (response.result == 'ok') {
                            var data = eval('(' + response.data + ')');
                            var charts = echarts.init(document.getElementById('cityCharts2'));
                            var iCata = [];
                            var iXse = [];
                            for (var i in data) {
                                iCata.push(data[i].Industry)
                                iXse.push({
                                    value: Number(data[i].Sum).toFixed(2),
                                    name: data[i].Industry
                                })
                            }
                            var option2 = {
                                legend: {
                                    data: iCata,
                                },
                                series: [{
                                    data: iXse,
                                }]
                            };
                            charts.setOption(option2);
                            $('#cityCharts2Title span').text(cname + '人口占比')
                        } else {

                        }
                    }
                })
            } else {
                // var url = serviceHost + "GetYDXFData?time=2018-01-01";
                var url = serviceHost + "GetYDXFData?time=" + y + "-" + m + "-01";
                $.ajax({
                    cache: false,
                    type: "Get",
                    url: encodeURI(url, "UTF-8"),
                    dataType: "json",
                    success: function (response) {
                        var data = eval('(' + response + ')');
                        var eCharts = echarts.init(document.getElementById('cityCharts2'));
                        var iCata = [];
                        var iXse = [];
                        for (var i in data[type + "Industry"]) {
                            iCata.push(data[type + "Industry"][i].Industry)
                            iXse.push({
                                value: Number(data[type + "Industry"][i].Sum).toFixed(2),
                                name: data[type + "Industry"][i].Industry
                            })
                        }
                        var option2 = {
                            legend: {
                                data: iCata,
                            },
                            series: [{
                                data: iXse,
                            }]
                        };
                        eCharts.setOption(option2);
                        $('#cityCharts2Title span').text('人口占比TOP5')
                    }
                })
            }
        }
    }
}

function mapRightClickEvent() {
    if ($('.indexBarItem[value=poi]').hasClass('selected')) {
        if (drawPolygonEnable) {
            tempPolygonPoints = tempPolygonPoints.slice(0, tempPolygonPoints.length - 1);
            drawPolygonPoints = drawPolygonPoints.slice(0, drawPolygonPoints.length - 1);
        } else {
            clearPoi();
        }
    } else if ($('.indexBarItem[value=bd]').hasClass('selected')) {
        BDCharts.hide();
    } else if ($('.indexBarItem[value=pk]').hasClass('selected')) {
        pkEnable = true;
        BDCompare.hide();
    } else if ($('.indexBarItem[value=district]').hasClass('selected')) {
        DistrictCharts.hide();
        for (var i in districtEntity) {
            for (var n in districtEntity[i]) {
                viewer.entities.getById(districtEntity[i][n]).show = false;
            }
        }
        zoomFunction();
    }
}

function clearPoi() {
    POI.hide();
    //drawCircleEnable = true;
    drawPolygonEnable = true;
    viewer.entities.remove(drawCircle);
    drawCircle = undefined;
    circleCenter = [];
    drawCircleRadius = 0;
    viewer.entities.remove(drawPolygon);
    drawPolygon = undefined;
    drawPolygonPoints = [];
    tempPolygonPoints = [];
    if (!$('.indexBarItem[value=poi]').hasClass('selected')) {
        $(".POIItem.selected").trigger('click')
    }

}

function mapLeftDoubleClickEvent(movement) {
    if ($('.indexBarItem[value=poi]').hasClass('selected')) {
        if (drawPolygonEnable) {
            drawCircleEnable = false;
            drawPolygonEnable = false;
            drawPolygonPoints = drawPolygonPoints.slice(0, drawPolygonPoints.length - 1);
            POI.createPolygon(drawPolygonPoints, '2019-03-11')
        }
    }
}

function mapMouseMoveEvent(movement) {
    if (drawCircleEnable) {
        if (circleCenter.length !== 0) {
            if (!drawCircle) {
                drawCircle = viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(circleCenter[0], circleCenter[1]),
                    ellipse: {
                        height: 0,
                        semiMinorAxis: new Cesium.CallbackProperty(function () {
                            return drawCircleRadius
                        }, false),
                        semiMajorAxis: new Cesium.CallbackProperty(function () {
                            return drawCircleRadius
                        }, false),
                        material: Cesium.Color.fromCssColorString('rgba(255,215,78,0.618)'),
                        outline: true,
                        outlineColor: Cesium.Color.fromCssColorString('rgba(255,202,20,1)'),
                        outlineWidth: 2
                    }
                })
            } else {
                var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);
                var ellipsoid = viewer.scene.globe.ellipsoid;
                var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var lng = Cesium.Math.toDegrees(cartographic.longitude);
                var from = turf.point([circleCenter[0], circleCenter[1]]);
                var to = turf.point([lng, lat]);
                var distance = turf.rhumbDistance(from, to);
                drawCircleRadius = Number(distance) * 1000;
            }

        }
    } else if (drawPolygonEnable) {
        var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);
        if (cartesian) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            tempPolygonPoints = drawPolygonPoints.concat([
                [lng, lat]
            ]);
            drawPolygonFunctin(tempPolygonPoints);
        }
    } else if (highlightDistrictEnable) {
        for (var i in districtEntity) {
            for (var n in districtEntity[i]) {
                viewer.entities.getById(districtEntity[i][n]).show = false;
            }
        }
        var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);
        if (cartesian) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var height = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
            var cartographic = ellipsoid.cartesianToCartographic(cartesian);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            var d = checkPointinDistrict([Number(lng), Number(lat)])
            if (d && d !== "") {
                for (var i in districtEntity[d]) {
                    viewer.entities.getById(districtEntity[d][i]).show = true;
                }
                if ($('.indexBarItem[value=bd]').hasClass('selected') || $('.indexBarItem[value=pk]').hasClass('selected')) {
                    if (height > 22085.139543417274) {
                        showBD('top');
                        showBD(d);
                    }
                }
            } else {
                if ($('.indexBarItem[value=bd]').hasClass('selected') || $('.indexBarItem[value=pk]').hasClass('selected')) {
                    if (height > 22085.139543417274) {
                        showBD('top');
                    } else {
                        showBD('all')
                    }
                }
            }
        }
    }
    if (highlightBDEnbale) {
        if (hoverBDid !== '') {
            viewer.entities.getById(hoverBDid).label.show = false;
            viewer.entities.getById(hoverBDid).billboard.scale = 1;
            hoverBDid = "";
        }
        var pick = viewer.scene.pick(movement.endPosition);
        if (pick && pick.id && pick.id.name && pick.id.name == 'BD') {
            var e = viewer.entities.getById(pick.id.id);
            hoverBDid = pick.id.id;
            e.billboard.scale = 1.2;
            e.label.show = true
        }
    }
}

function drawPolygonFunctin(points) {
    if (!drawPolygon) {
        drawPolygon = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
            point: {
                show: false,
                pixelSize: 10,
                color: Cesium.Color.fromCssColorString('rgba(255,215,78,1)'),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1
            },
            polyline: {
                show: false,
                positions: new Cesium.CallbackProperty(function () {
                    if (drawPolygonPoints.length == 2) {
                        var hie = [];
                        for (var i in drawPolygonPoints) {
                            hie.push(drawPolygonPoints[i][0]);
                            hie.push(drawPolygonPoints[i][1]);
                        }
                        return Cesium.Cartesian3.fromDegreesArray(hie)
                    } else if (tempPolygonPoints.length == 2) {
                        var hie = [];
                        for (var i in tempPolygonPoints) {
                            hie.push(tempPolygonPoints[i][0]);
                            hie.push(tempPolygonPoints[i][1]);
                        }
                        return Cesium.Cartesian3.fromDegreesArray(hie)
                    } else {
                        return Cesium.Cartesian3.fromDegreesArray([])
                    }
                }, false),
                width: 2,
                arcType: Cesium.ArcType.RHUMB,
                material: Cesium.Color.fromCssColorString('rgba(255,215,78,1)'),
            },
            polygon: {
                show: false,
                hierarchy: new Cesium.CallbackProperty(function () {
                    if (drawPolygonPoints.length > 2 && drawPolygonPoints.length == tempPolygonPoints.length) {
                        var hie = [];
                        for (var i in drawPolygonPoints) {
                            hie.push(drawPolygonPoints[i][0]);
                            hie.push(drawPolygonPoints[i][1]);
                        }
                        return Cesium.Cartesian3.fromDegreesArray(hie)
                    } else if (tempPolygonPoints.length > 2) {
                        var hie = [];
                        for (var i in tempPolygonPoints) {
                            hie.push(tempPolygonPoints[i][0]);
                            hie.push(tempPolygonPoints[i][1]);
                        }
                        return Cesium.Cartesian3.fromDegreesArray(hie)
                    } else {
                        return Cesium.Cartesian3.fromDegreesArray([])
                    }
                }, false),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 1,
                arcType: Cesium.ArcType.RHUMB,
                material: Cesium.Color.fromCssColorString('rgba(255,215,78,0.618)'),
            },
        });
    }
    drawPolygon.point.show = false;
    drawPolygon.polyline.show = false;
    drawPolygon.polygon.show = false;
    if (points.length == 1) {
        drawPolygon.position = Cesium.Cartesian3.fromDegrees(points[0][0], points[0][1], 0);
        drawPolygon.point.show = true;
    } else if (points.length == 2) {
        drawPolygon.polyline.show = true;
    } else {
        drawPolygon.polygon.show = true;
    }
}

function onWheel() {
    var scene = viewer.scene;
    var ellipsoid = scene.globe.ellipsoid;
    var height = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
    //console.log(height)
    if (height <= 7698418.631637648 && height > 365972.0196026819) {
        baseLayerList.satellite.show = false;
        baseLayerList.dark.show = true;
        baseLayerList.custom.show = false;
        //baseLayerList.dark.alpha = (height / 6903284.0216659745)
    } else if (height <= 365972.0196026819 && height >= 1535.396778972927) {
        baseLayerList.satellite.show = false;
        baseLayerList.dark.show = true;
        baseLayerList.custom.show = false;
    } else {
        baseLayerList.satellite.show = true;
        baseLayerList.dark.show = false;
        baseLayerList.custom.show = false;
    }
    if ($('.indexBarItem[value=bd]').hasClass('selected') || $('.indexBarItem[value=pk]').hasClass('selected')) {
        if (height > 22085.139543417274) {
            showBD('top')
        } else {
            showBD('all')
        }
    }
    if ($('.indexBarItem[value=poi]').hasClass('selected')) {
        if (height > 22085.139543417274) {
            POI.showPOI('heatmap')
        } else {
            POI.showPOI('icon')
        }
    }
}

function zoomFunction() {
    if (sessionStorage['role'] == 'district') {
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
    } else {
        var e = shEnveloped.geometry.coordinates[0];
        viewer.camera.flyTo({
            destination: Cesium.Rectangle.fromDegrees(e[0][0], e[0][1], e[1][0], e[2][1]),
            duration: 3,
        });
    }
    setTimeout(function () {
        onWheel();
    }, 3005)
}

///集合去重
arrayDistinct = function (arr) {
    var result = [];
    arr.forEach(function (v, i, arr) {
        var bool = arr.indexOf(v, i + 1);
        if (bool === -1) {
            result.push(v);
        }
    })
    return result;
};

var map, view;
var layerbaimo;

function initArcGISMap() {
    $("#mapContainer").css('width', $(window).width());
    $("#mapContainer").css('height', $(window).height());
    $("#mapContainer").css({
        position: 'absolute',
        top: 0,
    })
    require([
        "esri/identity/IdentityManager",
        "esri/Map",
        "esri/views/MapView",
        "esri/Basemap",
        "esri/geometry/SpatialReference",
        "esri/layers/TileLayer",
        "esri/layers/SceneLayer",
        "esri/Camera",
        "esri/core/urlUtils",
        "esri/views/SceneView",
        "esri/geometry/Extent",
    ], function (IdentityManager, Map, MapView, Basemap, SpatialReference, TileLayer, SceneLayer, Camera,
        urlUtils,
        SceneView, Extent) {

        IdentityManager.on("dialog-create", function () {
            IdentityManager.dialog.open = true
        })

        map = new Map();

        var layer = new TileLayer({
            title: "dark_map",
            //url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
            url: "http://changsanjiao.shsmi.com/changsanjiao/rest/services/swj/map_darkcolor/MapServer",
            id: "dark_map",
            visible: true,
            opacity: 1
        });
        map.add(layer);

        view = new SceneView({
            container: "mapContainer",
            map: map,
        });

        layerbaimo = new SceneLayer({
            title: "baimo_sl",
            url: "http://changsanjiao.shsmi.com/changsanjiao/rest/services/Hosted/baimo_fudan0729/SceneServer",
            id: "baimo_sl",
            visible: true,
            opacity: 1,
            renderer: {
                type: "simple",
                symbol: {
                    type: "mesh-3d",
                    symbolLayers: [{
                        type: "fill",
                        material: {
                            color: [83, 216, 216, 0.7],
                            colorMixMode: "replace"
                        },
                        edges: {
                            type: "solid",
                            color: [0, 0, 0, 0.6],
                            size: 1
                        }
                    }]
                }
            }
        });

        map.add(layerbaimo);

        view.when(function () {
            $('#mapContainer').hide();
            $('#indexBar div[value=city]').click();
        })

        view.on('click', function (evt) {
            if (evt.button == 2) {
                BDCharts.hide();
            }
        })
    })
}
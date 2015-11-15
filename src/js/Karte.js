/**
 * This script loads the data from the map server and displays it to the user
 * => All images and overlays are generated by the map server (including
 *  heatmaps and circles)
 * For each click in the map, the map server is contacted with the coordinates of
 * the click and responds by providing a list of all measurements near the clicked
 * point
 */

var cloudmade = false;
var useGoogle = true;
var useBasemapAT = true;
var useBingMaps = true;
var useRTRTiles = true;

//obsolete initialistation
var URL_MAP_SERVER = 'https://c01.netztest.at/RMBTMapServer/tiles'; //overridden from control server settings
var heatmap, points, map, markers;

var lastfeature;
var selectStop;
var curMapOptionObj = {};
var curFilterObj = {};
var click;
var points_heatmap_switch_level = 12;
var legends = new Object();
var marker; //current marker object

var allowClicking = false; //true, if clicking for popups is allowed at this zoom level



/*
 *
 * Click Handler for popup
 *
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
        defaultHandlerOptions: {
                'single': true,
                'double': true,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
        },
        initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
                OpenLayers.Control.prototype.initialize.apply(this, arguments);
                this.handler = new OpenLayers.Handler.Click(this, {
                        'click': this.trigger
                }, this.handlerOptions);
        },
        trigger: function(e) {
                loadMarker(map.getLonLatFromPixel(e.xy));
        }
});
*/

$(document).ready(function() {
        //requestBrowserData('RMBTsettings', 'viewmap');
        //get url from settings request
        var json_data = {
                "type": test_type,
                "name": test_name
        };
        $.ajax({
                url: controlProxy + "/" + wspath + "/settings",
                type: "post",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(json_data),
                success: function (data) {
                        URL_MAP_SERVER = data.settings[0].urls.url_map_server + "/tiles";
                        mapProxy  = data.settings[0].urls.url_map_server;
                        viewMapV3();
                }
        });
        
        $('.toggle-menu').on('click', function () {
        		 map.updateSize();
        });


    //for developing :)
    /*window.setTimeout(function() {
        loadMarker([1811686.3731147042, 6136656.527460036]);
    },2000);*/

});

function viewMapV3() {
   var bases = new Array();

    if (useBingMaps) {
        bases.push(
            new ol.layer.Tile({
            visible: true,
            preload: Infinity,
            title: 'Bing Maps',
            type: 'base',
            source: new ol.source.BingMaps({
                key: bing_api_key,
                imagerySet: 'Road'
                // use maxZoom 19 to see stretched tiles instead of the BingMaps
                // "no photos at this zoom level" tiles
                // maxZoom: 19
            })
        }));
    }

    if (useBasemapAT) {
        var templatepng =
            '{Layer}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png';
        var urlsbmappng = [
            '//maps1.wien.gv.at/basemap/' + templatepng,
            '//maps2.wien.gv.at/basemap/' + templatepng,
            '//maps3.wien.gv.at/basemap/' + templatepng,
            '//maps4.wien.gv.at/basemap/' + templatepng
        ];

        var templatejpeg =
            '{Layer}/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpeg';
        var urlsbmapjpeg = [
            '//maps1.wien.gv.at/basemap/' + templatejpeg,
            '//maps2.wien.gv.at/basemap/' + templatejpeg,
            '//maps3.wien.gv.at/basemap/' + templatejpeg,
            '//maps4.wien.gv.at/basemap/' + templatejpeg
        ];

        var LayerTypes = {
            BMAPGREY:  {
                label: Lang.getString("basemap_bmapgrau"),
                layer: "bmapgrau",
                tilePixelRatio : 1,
                urls: urlsbmappng
            },
            BASEMAP:  {
                label: Lang.getString("basemap_geolandbasemap"),
                layer: "geolandbasemap",
                tilePixelRatio : 1,
                urls: urlsbmappng
            },
            BMAPHIDPI:  {
                label: Lang.getString("basemap_bmaphidpi"),
                layer: "bmaphidpi",
                tilePixelRatio : 2,
                urls: urlsbmapjpeg
            },
            BMAPORTHO:  {
                label: Lang.getString("basemap_bmaporthofoto30cm"),
                layer: "bmaporthofoto30cm",
                tilePixelRatio : 1,
                urls: urlsbmapjpeg
            }
        };

        var addBasemapLayer = function(layerType) {
            // basemap.at
            //taken from http://www.basemap.at/application/js/mobile-base3.js
            var gg = ol.proj.get('EPSG:4326');
            var sm = ol.proj.get('EPSG:3857');


            var IS_CROSS_ORIGIN = 'anonymous';

            var tilegrid = new ol.tilegrid.WMTS({
                origin: [-20037508.3428, 20037508.3428],
                extent: [977650, 5838030, 1913530, 6281290],
                resolutions: [
                    156543.03392811998, 78271.51696419998,
                    39135.758481959994, 19567.879241008,
                    9783.939620504, 4891.969810252,
                    2445.984905126, 1222.9924525644,
                    611.4962262807999, 305.74811314039994,
                    152.87405657047998, 76.43702828523999,
                    38.21851414248, 19.109257071295996,
                    9.554628535647998, 4.777314267823999,
                    2.3886571339119995, 1.1943285669559998,
                    0.5971642834779999, 0.29858214174039993
                ],
                matrixIds: [
                    '0', '1', '2', '3', '4', '5',
                    '6', '7', '8', '9', '10',
                    '11', '12', '13', '14', '15',
                    '16', '17', '18', '19'
                ]
            });


            var bmap = new ol.source.WMTS({
                tilePixelRatio: layerType.tilePixelRatio,
                projection: sm,
                layer: layerType.layer, //'geolandbasemap',
                /*layer: hiDPI ? 'bmaphidpi' : 'geolandbasemap',*/
                style: 'normal',
                matrixSet: 'google3857',
                urls: layerType.urls,
                visible: true,
                //crossOrigin: IS_CROSS_ORIGIN,
                requestEncoding: /** @type {ol.source.WMTSRequestEncoding} */ ('REST'),
                tileGrid: tilegrid,
                attributions: [
                    new ol.Attribution({
                        html: 'Tiles &copy; <a href="//www.basemap.at/">' +
                        'basemap.at</a> (STANDARD).'
                    })
                ]
            });

            bases.push(new ol.layer.Tile({
                visible: false,
                preload: Infinity,
                source: bmap,
                title: layerType.label,
                type: 'base'
            }));
        };

        //add in reverse order
        addBasemapLayer(LayerTypes.BMAPORTHO);
        addBasemapLayer(LayerTypes.BMAPGREY);
        addBasemapLayer(LayerTypes.BMAPHIDPI);
        addBasemapLayer(LayerTypes.BASEMAP);


    }

    if (useRTRTiles) {
        bases.push(
            new ol.layer.Tile({
                source: new ol.source.OSM(),
                title: 'OpenStreetMap',
                type: 'base',
                visible: false
            })
        );
    }

    //Create the map object
    map = new ol.Map({
        layers: bases,
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }),
        target: 'speedtestmap',
        view: new ol.View({
            center: [0, 0],
            zoom: 2,
            maxZoom : 19
        })
    });
    
    
    /*var myControl = new ol.control.Control({
        element: $("#mycontrol")[0]
    });
    map.addControl(myControl);*/
    
    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Kartenquelle' // Optional label for button
    });
    map.addControl(layerSwitcher);
    
    markers = new ol.Overlay.Popup();
    map.addOverlay(markers);

    //bind click event
    map.on('singleclick', function(event) {
        //remove old overlay
        onFeatureUnselect();
        
        //load new overlay
        loadMarker(event.coordinate);
    });
    
    //bind on zoom event
    map.on('moveend', function(event) {
        displayZoom();
    });

    //Fit to Austrian bounds
    //https://stackoverflow.com/questions/22206570/how-do-bounds-work-in-openlayers-3
    var textent = [1252344.27125, 5846515.498922221, 1907596.397450879, 6284446.2299491335];
    map.getView().fit(textent, map.getSize());


    var displayed_open_test_uuid = (getParam("open_test_uuid"))?getParam("open_test_uuid"):null;
    //start async process to get select values
    requestBrowserData('RMBTmapfilter', { open_test_uuid: displayed_open_test_uuid });
    
    
    $("#auswahl_selector").find("input:radio[name='check_layer']").click(function () {
        setLayersV3();
    });

    //initialize geocoder, set form trigger for address search form
    geocoder_google = new google.maps.Geocoder();
    $("#address_search").submit(function () {
        searchAndPositionOnAddress();
        return false;
    });

    if (getParam("lat") && getParam("long") && getParam("accuracy") &&
            !isNaN(getParam("lat")) && !isNaN(getParam("long")) && !isNaN(getParam("accuracy"))) {
        //If there are coords given as parameters, center the map there
        //(--> User was in /Opentest and clicked on the map there)
        panToLatLong(parseFloat(getParam("lat")),
                parseFloat(getParam("long")),
                parseFloat(getParam("accuracy")));
    }
    else {
        //Pan to Test or User Position   
        panToLastUserTest();
        panToUserPosition();
    }
}


function convertLongLatToOpenLayersPoint(long,lat) {
    return ol.proj.transform([long, lat], 
                'EPSG:4326', 'EPSG:3857');
}

var geocoder_google;
function searchAndPositionOnAddress() {
        var address = $("#address_search #address_search_input").val();
        
        //add "Austria" for ZIP Codes
        if (parseInt(address) !== NaN && parseInt(address) > 0) {
            address += ", Austria";
        }
        
        
        $('#spinner').spin('modal');
        
        geocoder_google.geocode( { 'address': address}, function(results, status) {
                $('#spinner').spin('modal');
                if (status === google.maps.GeocoderStatus.OK) {
                        var pan = function(i) {
                            $("#address_search .address_input").show();
                            $("#address_search .selection").hide();

                            $("#address_search #address_search_input").val(results[i].formatted_address);

                            var ne = convertLongLatToOpenLayersPoint(results[i].geometry.viewport.getNorthEast().lng(), results[i].geometry.viewport.getNorthEast().lat()); //North East
                            var sw = convertLongLatToOpenLayersPoint(results[i].geometry.viewport.getSouthWest().lng(), results[i].geometry.viewport.getSouthWest().lat()); //South West
                            
                            //http://openlayers.org/en/v3.7.0/apidoc/ol.html#Extent
                            //[minx, miny, maxx, maxy]
                            var extent=[
                                ne[0], ne[1],
                                sw[0], sw[1]
                            ];
                            
                            map.getView().fit(extent, map.getSize());
                        };
                
                        if (results.length > 1) {
                            $("#address_search .address_input").hide();
                            $("#address_search .selection").show();
                            $("#address_selection").empty();
                            $("#address_selection").unbind("change");
                            $("#address_selection").append("<option value='-1'>" + Lang.getString("pleaseSelect") + "</option>");
                            
                            
                            //address not unique
                            for(var i=0;i<results.length;i++) {
                                $("#address_selection").append("<option value='" + i +  "'>" + results[i].formatted_address + "</option>");
                            }
                            
                            $("#address_selection").bind("change", function() {
                                var id = $("#address_selection").val();
                                if (id >= 0) {
                                    pan(id);
                                }
                            });
                        }
                        else {
                            pan(0);
                        }                       
                        
                } else {
                        alert(Lang.getString('addressNotFound'));
                }
        });
        
}

/**
 * Center the map on the position of the last test conducted by the
 * user (as given in the cookie 'coords'
 */
function panToLastUserTest() {
    //copied from geolocation, cannot directly use due to side effects
        var coords = getCookie('coords');
        //console.log(coords);
        if (coords) {
                coords = JSON.parse(coords);
                //console.log(tmpcoords);
        }
        if (coords && coords['lat'] > 0 && coords['long'] > 0) {
            var lat = coords['lat'];
            var long = coords['long'];
            //alert(lat + ", " + long);

            panToLatLong(lat, long, coords.accuracy);
        }
}

/**
 * Sets the current user position as center of the map
 * and sets the 'coords' cookie which can later be used
 * for conducting tests
 */
function panToUserPosition() {
        //zoom to user position
        var coords;
        var geolocation_callback = function(position) {
                if (position) {
                        coords = new Object();
                        coords['lat'] = position.coords.latitude;
                        coords['long'] = position.coords.longitude;
                        coords['accuracy'] = position.coords.accuracy;
                        coords['altitude'] = position.coords.altitude;
                        coords['heading'] = position.coords.heading;
                        coords['speed'] = position.coords.speed;
                        coords['tstamp'] = position.timestamp;
                        //console.log("coords: "+coords);
                        var tmpcoords = JSON.stringify(coords);
                        //console.log("tmpcoords: "+tmpcoords);
                        setCookie('coords', tmpcoords, 3600);
                }

                panToLatLong(coords.lat, coords.long, coords.accuracy);

        };
        var geolocation_error = function(error) {
                console.log("error retrieving user position")
        };

        //copied from geolocation, cannot directly use due to side effects
        var coords = getCookie('coords');
        //console.log(coords);
        if (coords) {
                coords = JSON.parse(coords);
                //console.log(tmpcoords);
        }
        if (coords && coords['lat'] > 0 && coords['long'] > 0) {
                geolocation_callback(false);
        }
        else {
                if (navigator.geolocation) {
                        var options = {
                                enableHighAccuracy: geo_HighAccuracy,
                                timeout: geo_timeout,
                                maximumAge: geo_maximumAge
                        };
                        navigator.geolocation.getCurrentPosition(geolocation_callback, geolocation_error, options);
                } else {
                        //not supported
                }
        }
}

/**
 * Center the map at the given point
 * with a zoom level suitable to the given accuracy
 * @param {float} lat
 * @param {float} long
 * @param {float} accuracy
 */

function panToLatLong(lat, long, accuracy) {
    map.getView().setCenter(convertLongLatToOpenLayersPoint(long, lat));

    var zoomLevel = 11;
    if (accuracy !== null) {
        if (accuracy < 100) {
            zoomLevel = 17;
        } else if (accuracy < 1000) {
            zoomLevel = 13;
        }
    }
    map.getView().setZoom(zoomLevel);
}

/**
 * Get the layers from user input
 * and update the map accordingly
 * e.g. only heatmap, only points
 */
function setLayersV3() {

    var cardtyp = $("#map_options").val();
    var tmp = cardtyp.split('/');
    var typ = tmp[0];
    $("select[name=statistical_method]").removeAttr("disabled");
    //console.log($("input:radio:checked[name='check_layer']").val());
    if ($("input:radio:checked[name='check_layer']").val() == 'shapes') {
        points.setVisible(false);
        heatmap.setVisible(false);
        shapes.setVisible(true);
        onFeatureUnselect();
        allowClicking = false;
    }
    else if ($("input:radio:checked[name='check_layer']").val() == 'heatmap') {
        points.setVisible(false);
        heatmap.setVisible(true);
        shapes.setVisible(false);
        onFeatureUnselect();
        allowClicking = false;
    }
    else if ($("input:radio:checked[name='check_layer']").val() == 'points') {
        points.setVisible(true);
        heatmap.setVisible(false);
        shapes.setVisible(false);
        $("select[name=statistical_method]").attr("disabled","disabled");
        allowClicking = true;
    }
    else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() < points_heatmap_switch_level && typ == 'browser') {
        points.setVisible(false);
        heatmap.setVisible(false);
        shapes.setVisible(true);
        onFeatureUnselect();
        allowClicking = false;
    }
    else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() < points_heatmap_switch_level) {
        points.setVisible(false);
        heatmap.setVisible(true);
        shapes.setVisible(false);
        onFeatureUnselect();
        allowClicking = false;
    }
    else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() >= points_heatmap_switch_level && typ == 'browser') {
        points.setVisible(true);
        heatmap.setVisible(false);
        shapes.setVisible(true);
        allowClicking = true;
    }
    else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() >= points_heatmap_switch_level) {
        points.setVisible(true);
        heatmap.setVisible(true);
        allowClicking = true;
    }
}


function displayZoom() {
        //console.log(map.getZoom()+' - '+$("input:radio:checked[name='check_layer']").val());
        var cardtyp = $("#map_options").val();
        if (cardtyp === undefined) {
            return;
        }
        var tmp = cardtyp.split('/');
        var typ = tmp[0];
        if (map.getView().getZoom() >= 17) {
                $('.zoomInItemInactive').css('display', 'none');
        }
        else {
                $('.zoomInItemInactive').css('display', 'block');
        }
        if (map.getView().getZoom() <= 2) {
                $('.zoomOutItemInactive').css('display', 'none');
        }
        else {
                $('.zoomOutItemInactive').css('display', 'block');
        }
        if (typ != 'browser' && $("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() < points_heatmap_switch_level) {
                points.setVisible(false);
                heatmap.setVisible(true);
                shapes.setVisible(false);
                //onFeatureUnselect();
                allowClicking = false;
        }
        else if (typ != 'browser' && $("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() >= points_heatmap_switch_level) {
                points.setVisible(true);
                heatmap.setVisible(true);
                shapes.setVisible(false);
                allowClicking = true;
        }
        else if (typ == 'browser' && $("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() < points_heatmap_switch_level) {
                points.setVisible(false);
                heatmap.setVisible(false);
                shapes.setVisible(true);
                allowClicking = false;
        }
        else if (typ == 'browser' && $("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() >= points_heatmap_switch_level) {
                points.setVisible(true);
                heatmap.setVisible(false);
                shapes.setVisible(true);
                allowClicking = true;
        }

}

function loadMarker(lonlat) {
    if (!allowClicking) {
        return;
    }

    curFilterObj["highlight"] = getCookie("RMBTuuid");
    var json_data = {
        "language": selectedLanguage,
        coords: {
            "x": lonlat[0],
            "y": lonlat[1],
            "z": map.getView().getZoom()
        },
        filter: curFilterObj,
        options: curMapOptionObj
    };

    $.ajax({
        //url : "http://localhost:8080/RMBTMapServer/tiles/markers",
        url: mapProxy + "/tiles/markers",
        type: "post",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(json_data),
        success: function (data, textStatus, jqXHR) {
            if (data.measurements && data.measurements[0]) {
                addMarkerV3(data.measurements[0].lat, data.measurements[0].lon, data.measurements);

                //@TODO v3
                //selectStop.select(lastfeature);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert("Error beim settings-Abruf " + xhr.status + " " + thrownError + " " + ajaxOptions);
        }
    });
}

function onFeatureUnselect(event) {
    markers.hide();
    /*var feature = lastfeature;
        
        if (feature && feature.popup) {
                map.removePopup(feature.popup);
                feature.destroyPopup();
                delete feature.popup;
                markers.removeAllFeatures();
        }*/
}


//add datetime helper
Handlebars.registerHelper('formatDate', function (timestamp) {
    var d = new Date(timestamp);
    return moment(d).format(Lang.getString('map_dateformat'));
});

function addMarkerV3(lat, lon, data) {
    var coordinate = [lat, lon];
    markers.setPosition(coordinate);

    var template = Handlebars.compile($("#markerTemplate").html());
    var html = template({
        data: data
    });

    
    markers.show(coordinate, html);

    //$(marker).html(html);
}

function redrawLegend(cardtyp) {
        //redraw Legend
        //console.log(legends);
        //console.log(cardtyp);
        //console.log(legends[cardtyp].heatmap_color_high);
        $.each(legends[cardtyp], function(key, row) {
                $('#' + key).html(row);
        });

        var tr = "";
        var tr_length = legends[cardtyp].colors.length;
        var tr_length_minus_1 = tr_length - 1;
        $.each(legends[cardtyp].colors, function(key, value) {
                tr += '<td class="td_' + key + '"></td>';
        });
        tr += '<td class="td_' + tr_length + '"></td>';
        $('.legend_tr').html(tr);

        $("table.map_key_color td.td_0").css('background-color', legends[cardtyp].colors[0]);
        var c1, c2, key_minus_1;
        $.each(legends[cardtyp].colors, function(key, value) {
                if (key > 0 && key < tr_length) {
                        key_minus_1 = key - 1;
                        c1 = legends[cardtyp].colors[key_minus_1];
                        c2 = value;
                        background_value = 'background: -moz-linear-gradient(left, ' + c1 + ' 0%, ' + c2 + ' 100%); background: -webkit-gradient(linear, left top, right top, color-stop(0%,' + c1 + '), color-stop(100%,' + c2 + ')); background: -webkit-linear-gradient(left, ' + c1 + ' 0%,' + c2 + ' 100%); background: -o-linear-gradient(left, ' + c1 + ' 0%,' + c2 + ' 100%); background: -ms-linear-gradient(left, ' + c1 + ' 0%,' + c2 + ' 100%); background: linear-gradient(to right, ' + c1 + ' 0%,' + c2 + ' 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr="' + c1 + '", endColorstr="' + c2 + '",GradientType=1 ); ';
                        $("table.map_key_color td.td_" + key).attr('style', background_value);
                }

        });
        $("table.map_key_color td.td_" + legends[cardtyp].colors.length).css('background-color', legends[cardtyp].colors[tr_length_minus_1]);

        var cap = "";
        var cap_length = legends[cardtyp].heatmap_captions.length;
        var cap_length_minus_1 = cap_length - 1;
        var cap_max = cap_length * 2 + 1;
        var cap_val;

        for (var i = 0; i < cap_max; i++) {
                cap_val = (i - 1) / 2;
                if (i % 2 == 1)
                        cap += '<td class="td_' + i + ' value">' + legends[cardtyp].heatmap_captions[cap_val] + '</td>';
                else
                        cap += '<td class="td_' + i + ' spacer"></td>';
        }
        cap += '<td class="unit">' + legends[cardtyp].heatmap_caption_unit + '</td>';
        $('#heatmap_captions').html(cap);

        if (legends[cardtyp].classification_high > legends[cardtyp].classification_low) {
                $("#classification_high").html(' &ge; ' + legends[cardtyp].classification_high + ' ' + legends[cardtyp].heatmap_caption_unit + ' &gt; ');
                $("#classification_low").html(' &ge; ' + legends[cardtyp].classification_low + ' ' + legends[cardtyp].heatmap_caption_unit + ' &gt; ');
        }
        else if (legends[cardtyp].classification_high < legends[cardtyp].classification_low) {
                $("#classification_high").html(' &le; ' + legends[cardtyp].classification_high + ' ' + legends[cardtyp].heatmap_caption_unit + ' &lt; ');
                $("#classification_low").html(' &le; ' + legends[cardtyp].classification_low + ' ' + legends[cardtyp].heatmap_caption_unit + ' &lt; ');
        }

}

function redrawOverlay() {
        var as = $('#auswahl_selector select');
        var auswahl = '';
        var tmp, typ, cardtyp, background_value;
        curMapOptionObj = {};
        $.each(as, function(key, row) {
                if ($(row).val().length > 0) {
                        var tmp = $(row).attr("name");
                        auswahl += '&' + $(row).attr("name") + '=' + $(row).val();
                        curMapOptionObj[$(row).attr("name")] = $(row).val();
                        cardtyp = $(row).val()
                        tmp = cardtyp.split('/');
                        typ = tmp[0];
                        $('#filter_selector>div').css("display", "none");
                        $('#filter_' + typ).css("display", "block");
                        //console.log(cardtyp);


                        if ($("input:radio:checked[name='check_layer']").val() == 'heatmap' && typ == 'browser') {

                                points.setVisible(false);
                                heatmap.setVisible(false);
                                //markers.setVisible(false);
                                shapes.setVisible(true);
                                allowClicking = false;

                        }
                        else if ($("input:radio:checked[name='check_layer']").val() == 'heatmap' && typ != 'browser') {
                                points.setVisible(false);
                                heatmap.setVisible(true);
                                shapes.setVisible(false);
                                allowClicking = false;
                                //markers.setVisible(false);
                                //allowClicking = false;

                        }
                        else if ($("input:radio:checked[name='check_layer']").val() == 'points') {
                                points.setVisible(true);
                                heatmap.setVisible(false);
                                shapes.setVisible(false);
                                //markers.setVisible(true);
                                //click.activate();
                                allowClicking = true;

                        }
                        else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() < points_heatmap_switch_level && typ == 'browser') {
                                points.setVisible(false);
                                heatmap.setVisible(false);
                                shapes.setVisible(true);
                                allowClicking = false;            
                                //markers.setVisible(false);                                

                        }
                        else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() < points_heatmap_switch_level && typ != 'browser') {
                                points.setVisible(false);
                                heatmap.setVisible(true);
                                shapes.setVisible(false);
                                onFeatureUnselect();
                                //markers.setVisible(false);
                                allowClicking = false;

                        }
                        else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() >= points_heatmap_switch_level && typ == 'browser') {
                                points.setVisible(true);
                                heatmap.setVisible(false);
                                shapes.setVisible(false);
                                allowClicking = true;
                                //click.activate();

                        }
                        else if ($("input:radio:checked[name='check_layer']").val() == 'automatic' && map.getView().getZoom() >= points_heatmap_switch_level && typ != 'browser') {
                                points.setVisible(true);
                                heatmap.setVisible(true);
                                shapes.setVisible(false);
                                //click.activate();

                        }
                        //}
                }

        });


        var es = $('#filter_' + typ + ' select');
        var filter = '?highlight=';
        filter += (getCookie("RMBTuuid")) ? getCookie("RMBTuuid") : "null";
        curFilterObj = {};
        $.each(es, function(key, row) {
                if ($(row).val().length > 0) {
                        var tmp = $(row).attr("name");
                        filter += '&' + $(row).attr("name") + '=' + $(row).val();
                        curFilterObj[$(row).attr("name")] = $(row).val();
                }

        });
        
        //if qostest -> add source parameter
        if (developerCode > 0) {
            filter += "&developer_code=" + developerCode;
            curFilterObj['developer_code'] = developerCode;
        }

        //set tile urls to new filter selection
        var points_url = URL_MAP_SERVER + '/points/{z}/{x}/{y}.png' + filter + auswahl;
        points.getSource().setUrl(points_url);
        //points.redraw(true);

        var heatmap_url = URL_MAP_SERVER + '/heatmap/{z}/{x}/{y}.png' + filter + auswahl;
        heatmap.getSource().setUrl(heatmap_url);
        //heatmap.redraw(true);

        var shapes_url = URL_MAP_SERVER + '/shapes/{z}/{x}/{y}.png' + filter + auswahl;
        shapes.getSource().setUrl(shapes_url);
        //shapes.redraw(true);

        // Remove open Popups
        onFeatureUnselect();

        redrawLegend(cardtyp);


}

function defaultMapFilterV3() {
    var as = $('#auswahl_selector select');
    var auswahl = '';
    var tmp, typ, cardtyp, background_value;
    curMapOptionObj = {};
    $.each(as, function(key, row) {

        if ($(row).val().length > 0) {
            var tmp = $(row).attr("name");
            auswahl += '&' + $(row).attr("name") + '=' + $(row).val();
            curMapOptionObj[$(row).attr("name")] = $(row).val();
            cardtyp = $(row).val()
            tmp = cardtyp.split('/');
            typ = tmp[0];
            $('#filter_selector>div').css("display", "none");
            $('#filter_' + typ).css("display", "block");

        }

    });

    var es = $('#filter_' + typ + ' select');
    //quick hack to disable test-highlighting and thus make caching effective
    var filter = '?null'; //'?highlight=' + getCookie("RMBTuuid");
    curFilterObj = {};
    $.each(es, function(key, row) {
        if ($(row).val().length > 0) {
            var tmp = $(row).attr("name");
            filter += '&' + $(row).attr("name") + '=' + $(row).val();
            curFilterObj[$(row).attr("name")] = $(row).val();
        }

    });

    //if qostest -> add source parameter
    if (developerCode > 0) {
        filter += "&developer_code=" + developerCode;
        curFilterObj['developer_code'] = developerCode;
    }

    var points_url = URL_MAP_SERVER + '/points/{z}/{x}/{y}.png' + filter + auswahl;

    var heatmap_url = URL_MAP_SERVER + '/heatmap/{z}/{x}/{y}.png' + filter + auswahl;

    var shapes_url = URL_MAP_SERVER + '/shapes/{z}/{x}/{y}.png' + filter + auswahl;

    heatmap = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: heatmap_url,
            visible: true
        })
    });
    map.addLayer(heatmap);

    shapes = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: shapes_url,
            visible: true
        })
    });
    map.addLayer(shapes);

    points = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: points_url,
            visible: true
        })
    });
    map.addLayer(points);



    //also update the layers in case
    //that the user's browser did some
    //local form caching
    setLayersV3();
}


// "Lightbox":
$("#lightboxbutton").live("click", function() {
        if (mapState === "small")
                switchToLargeMap();
        else
                switchToSmallMap();
        
});

//currently display map state - can be "small" or "large"
var mapState = "small";
var mapStateSmallOrig;


//Resize event
$(window).resize(function() {
    if (mapState === "large") {
        var mapId = "#speedtestmap";
        var mapStateButtonId = "#lightboxbutton";
        
        var windowHeight = $(window).height();
        var windowWidth = $(window).width();
        
        $(mapId).css("left","0px");
        //var leftOffset = $(mapId).offset().left;
        
        $(mapId).css("width", windowWidth + "px");
        $(mapId).css("height", windowHeight + "px");
        //$(mapId).css("left", -leftOffset + "px");
        
    }
});


/**
 * switch to the small map state (=standard state)
 */
function switchToSmallMap() {
        var mapId = "#speedtestmap";
        var mapStateButtonId = "#lightboxbutton";
                
        $(mapStateButtonId).hide();
        
        //animate back
        $(mapId).animate({
                left: mapStateSmallOrig.left + "px",
                top: mapStateSmallOrig.top + "px",
                width: mapStateSmallOrig.width,
                height: mapStateSmallOrig.height,
                        //height: windowHeight
        }, {
                duration: 400,
                progress: function() {
                       map.updateSize();
                },
                complete: function() {
                        map.updateSize();
                        $(mapStateButtonId).removeAttr("style");
                        $(mapStateButtonId).show();
                        $(mapStateButtonId).val(Lang.getString("largeView"));
                        
                        //now, put back, reset styling
                        $(mapId).prependTo("#speedtestmapcontainer")
                        $(mapStateButtonId).prependTo("#speedtestmapcontainer")
                        $(mapId).removeAttr("style");
                }});
        
        
        mapState = "small";
        
}

function switchToLargeMap() {
    var mapId = "#speedtestmap";
    var mapStateButtonId = "#lightboxbutton";

    //get screen size and old offsets
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    var leftOffset = $(mapId).offset().left;

    var filterTopOffset = $("#auswahl_selector").offset().top;
    var topOffset = $(mapId).offset().top;
    
    //save original positions
    mapStateSmallOrig = {
        left: leftOffset,
        top: topOffset,
        height: $(mapId).height(),
        width: $(mapId).width(),
        mapStateButtonLeft: $(mapStateButtonId).position().left

    };
    
    //move, hide button during transition
    $(mapId).prependTo("body");
    $(mapStateButtonId).prependTo("body");
    $(mapStateButtonId).hide();
    
    //set absolute position
    $(mapId).css("position", "absolute");
    $(mapId).css("left",leftOffset + "px");
    $(mapId).css("top",topOffset + "px");
    $(mapId).css("z-index",101); //menu trigger is 100

    //anmiate the map
    $(mapId).animate({
        left: "0px",
        width: windowWidth + "px",
        height: windowHeight
    }, {
        duration: 400,
        progress: function (animation, progress, remainingMs) {
            map.updateSize();
        },
        complete: function () {
            //reset width since we now have a scrollbar
            var newWidth = $(window).width() - 75;
            $(mapId).css("width", newWidth);

            /*var newLeftOffset = $(mapId).offset().left;
            if (newLeftOffset < 0) {
                $(mapId).css("left", (-leftOffset - newLeftOffset));
            }*/
            
            $(mapId).css("left", "0px");
            $(mapId).css("width", "100%");

            map.updateSize();
            $(mapStateButtonId).css("top",topOffset + "px");
            $(mapStateButtonId).show();
            $(mapStateButtonId).val(Lang.getString("smallView"));
        }
    });
    


    //scroll to the map
    $('html, body').animate({scrollTop: filterTopOffset}, 'slow');

    mapState = "large";
}

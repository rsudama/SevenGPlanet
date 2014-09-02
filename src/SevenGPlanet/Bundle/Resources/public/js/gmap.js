function centreBoth(latlng) {
    //centre both the main map and the streetview
    //applies to the location page
    firstmarker.setPosition(latlng);
    firstmarkersv.setPosition(latlng);
    map.setCenter(latlng);
}

function setPOV(pos) {
    //calclate the bearing and POV settings between the panorama and the maker
    var streetViewMaxDistance = 100;
    var streetViewService = new google.maps.StreetViewService();

    streetViewService.getPanoramaByLocation(pos, streetViewMaxDistance, function (streetViewPanoramaData, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            var oldPoint = pos;
            pos = streetViewPanoramaData.location.latLng;

            var heading = google.maps.geometry.spherical.computeHeading(pos, oldPoint);
            mapsv.setPov({
                heading: heading,
                zoom: 1,
                pitch: 0
            });
            mapsv.setPosition(pos);
            map.setStreetView(mapsv);
            mapsv.setVisible(true);
        } else {
            mapsv.setVisible(false);
            // $this.text("Sorry! Street View is not available.");
            // no street view available in this range, or some error occurred
        }
    });
}

//delete any markers and heatmaps and routes
//applies to the analysis page
function clearMarkers(callback) {
    for (var j = 1; j < 5; j += 1) {
        clearSet(j);
    }
    markerSet.length = 0;
    heatmap.length = 0;
    var bounds = new google.maps.LatLngBounds();
    //hide the colwit panel and reset the dropdown
    $('#colwithpanel').hide();
    $('#focus').val('all');

    // Make sure the callback is a function
    if (typeof callback === "function") {
        callback();
    }
}

function clearSet(set) {
    if (markerSet[set] != undefined) {
        for (var i = 0; i < markerSet[set].length; i += 1) {
            markerSet[set][i].setMap(null);
        }
        markerSet[set] = undefined;
    }

    if (heatmap[set] != undefined) {
        heatmap[set].setMap(null);
    }
}

//make markers visible
function makeVisible(set) {
    //show hide the heatmap and markers
    heatmap[set].setMap((booHeat) ? map : null);

    for (var i = 0; i < markerSet[set].length; i += 1) {
        markerSet[set][i].setMap(booHeat ? null : map); //setVisible (booHeat==false);
    }
}

function add_one_marker(pos, mData, otherIcon, set) {
    var dAcc, icon, icon1, icon2, marker;
    if (set < 3) {
        dAcc = mData.accdate;
    } else {
        dAcc = mData.inputdate;
    }
    dAcc = dAcc.substring(8, 10) + '-' + dAcc.substring(5, 7) + '-' + dAcc.substring(0, 4);
    //Set the icon
    switch (set) {
        case 1 :
        case 2 :
            icon1 = mData.icon1;
            icon2 = ( mData.icon2 == '' ? 'bus' : mData.icon2 );
            icon = (otherIcon ? icon2 : icon1);
            break;
        case 3 :
            icon = 'red_circle';
            break;
        case 4 :
            icon = 'goldbus';
            break;
    }
    //create the marker
    marker = new google.maps.Marker({
        map: map,
        visible: true,
        position: pos,
        icon: image_dir + icon + '.png',
        icon1: icon1,
        icon2: mData.icon2,
        zindex: set,
        depot: mData.depot,
        inputdate: mData.inputdate
    });

    if (set == 3) {
        //drivegreen
        marker.setOptions({
            type: 'drivegreen',
            title: 'DriveGreen Red Event - Braking - ' + dAcc + ' ' + dAcc.substring(12, 16),
            incidentID: 0,
            region: '',
            company: ''
        });
    } else {
        marker.setOptions({
            type: 'incident',
            title: mData.incidentid + ' - ' + mData.type + ' - ' + dAcc + ' - ' + mData.acctime.substr(0, 5),
            incidentID: mData.incidentid,
            region: mData.region,
            company: mData.company
        });
    }

    //Add StreetView to the marker click listener
    bind_SV_click(marker);

    return marker;
}

function bind_SV_click(marker) {
    google.maps.event.addListener(marker, "click", function () {
        $('#filterpanel').slideUp("slow");
        $('#sv-popup').css({left: 0});
        //var clickedMarker = marker;
        sv.getPanoramaByLocation(marker.getPosition(), 50, processSVData);
        if (marker.type == 'incident') {
            getDetail(marker);
        } else {
            $('#popupcontent').html('DriveGreen red event');
        }
    });
}

//get additional detail for the popup view
function getDetail(marker) {
    //load data from the incident detail table
    var request = $.ajax({
        url: Routing.generate('_transit_get_incident_detail', { incidentId: marker.incidentId }),
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });

    request.done(function(data) {
        //$('#popupcontent').html(response);
        var detail;
        if (data['error'] == 1) {
            detail = 'No data found for that incident';
        }
        else {
            detail = data['description'] +
                "<br/><br/>Collision with: " + data['collidedWith'] +
                "<br/>Impact: " + data['impact'] +
                "<br/>The bus was: " + data['ourVehicleAction'] + "<br/>";
            //if (!is_user_in_group('[WP training]')) {
            {
                detail += "Fault: " + data['blame'] +
                    "<br />Preventable: " + data['preventable'] + "<br/>";
            }
            detail += "Route: " + data['route'] + ", " + data['location'] + ", " + data['road'] +
                "<br/>Input Date: " + data['inputDate'] +
                "<br/>Position: " + data['latitude'].toFixed(3) + " : " + data['longitude'].toFixed(3);
            //if (is_user_in_group('Relocate')) {
            {
                detail += "<div id='relocate'><a href='#'>(relocate)</a></div>";
            }
            detail += "<br/>" + data['region'] + " : " + data['company'] + " : " + data['depot'];
        }

        $('#popupcontent').html(detail);
        $('#relocate').click(function () {
            enter_relocate_mode(marker);
        });
    });

    //check if this is a fave, not for drivegreen
    if (clickedMarker.type != 'incident') {
        $('#popupfave').hide();
        $('#popupmapstar').hide();
    } else {
        $('#popupfave').hide();
        $('#popupmapstar').show();
        $('#popupmapstar').addClass('unstarred');
        $('#popupmapstar').removeClass('starred');
        /*
        jQuery.ajax({
            type: 'POST',   // Adding Post method
            url: 'http://dev.mapinsight.co.uk/wp-admin/admin-ajax.php', // Including ajax file
            data: {"action": "get_fave_incident_data",
                "incidentid": clickedMarker.incidentID
            },
            success: function (response) {
                if (response == '[]') {
                    //not a fave and never has been
                    $('#favetitle').val('');
                    $('#favedesc').val('');
                } else {
                    var faveData = $.parseJSON(response);
                    if (faveData[0].active) {
                        //make the star yellow
                        $('#popupmapstar').addClass('starred');
                        $('#popupmapstar').removeClass('unstarred');
                        $('#popupfave').show();
                    }
                    $('#favetitle').val(faveData[0].title);
                    $('#favedesc').val(faveData[0].description);
                }
            }
        });
        */
    }
}

//handle the Streetview data
function processSVData(data, status) {
    var marker = clickedMarker;
    if (status == google.maps.StreetViewStatus.OK) {
        $('#popuptitle').html(marker.getTitle());
        $('#popup-canvas').slideDown();
        mapsv.setPosition(marker.getPosition());
    } else {
        $('#popuptitle').html(marker.getTitle() + ' - No Streetview');
        $('#popup-canvas').slideUp();
        mapsv.setPosition(marker.getPosition());
    }
    // Put a marker on the panorama
//    if (editing) {
//        markersv.setPosition(marker.getPosition());
//    } else {

    /*
        var markersv = new google.maps.Marker({
            map: mapsv,
            position: marker.getPosition(),
            icon: marker.icon
        });
    */
//    }
    //look at the marker
    var heading = google.maps.geometry.spherical.computeHeading(data.location.latLng,marker.getPosition());
    mapsv.setPov( {heading: heading,
        zoom: 1,
        pitch: 0 })
}

/*
function useLocation() {
    // Try W3C Geolocation (Preferred)
    if (navigator.geolocation) {
        //bingo, we've got a location
        navigator.geolocation.getCurrentPosition(function (position) {
            //set up the watch
            toggleWatch(position);
        }, function () {
            alert("Geolocation service failed.");
        });
    } else {
        alert("Geolocation service failed.");
    }
}
*/

//START - Location based functions

var booWatch = false;
var watchID;
var locMarker;

function toggleWatch() {
    if (booWatch) {
        navigator.geolocation.clearWatch(watchID);
        booWatch = false;
        $('#useLocation').addClass('inactive').removeClass('active');
        locMarker.setMap(null);
        //destroy the listener
        google.maps.event.clearListeners(map, 'dragend');
    } else {
//     try {
        watchID = navigator.geolocation.watchPosition(locMoved, locFail,
            { enableHighAccuracy: true });
        booWatch = true;
        //set up listener to trun off if map is panned
        google.maps.event.addListener(map, 'dragend', function (event) {
            toggleWatch();
        });
        //get the starting point
        navigator.geolocation.getCurrentPosition(function (pos) {
            var initialLocation = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            map.setCenter(initialLocation);
            $('#useLocation').addClass('active').removeClass('inactive');
            //set up a marker
            var markerImage = new google.maps.MarkerImage(image_dir + 'blue-dot.png',
                new google.maps.Size(16, 16),
                new google.maps.Point(0, 0),
                new google.maps.Point(8, 8));
            locMarker = new google.maps.Marker({
                map: map,
                visible: true,
                position: initialLocation,
                title: 'current location',
                icon: markerImage
            });
        });
//     }
//     catch(err) { alert(err) };
    }
}

function locFail() {
    //alert("Failed to retrieve location.");
}

function locMoved(pos) {

    var lat = pos.coords.latitude;
    var lon = pos.coords.longitude;

    var point = new google.maps.LatLng(lat, lon);

    if (pos.coords.accuracy < 100) {
        map.setCenter(point);

        if (locMarker != null) {
            locMarker.setPosition(point);
        }
    }
}

//END - Location based functions
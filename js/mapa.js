var geocoder;
var map;
var directionsDisplay; // Instanciaremos ele mais tarde, que será o nosso google.maps.DirectionsRenderer
var directionsService = new google.maps.DirectionsService();
var idInfoBoxAberto;
var infoBox = [];
var markers = [];

function abrirInfoBox(id, marker) {
    if (typeof(idInfoBoxAberto) == 'number' && typeof(infoBox[idInfoBoxAberto]) == 'object') {
        infoBox[idInfoBoxAberto].close();
    }
 
    infoBox[id].open(map, marker);
    idInfoBoxAberto = id;
}

function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer();

	if (navigator.geolocation) { // Se o navegador do usuário tem suporte ao Geolocation
		navigator.geolocation.getCurrentPosition(function (position) {
			marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		});
	} else {
    	var latlng = new google.maps.LatLng(0, 0);
	}

    var options = {
        zoom: 5,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    map = new google.maps.Map(document.getElementById("mapa"), options);

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("trajeto-texto"));
    geocoder = new google.maps.Geocoder();
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
    });
 
    marker.setPosition(latlng);
}
 

function carregarPontos() {
 
    $.getJSON('js/lugares.json', function(pontos) {
 		
        $.each(pontos, function(index, ponto) {
 			
 			var infowindow = new google.maps.InfoWindow(), marker;

 			var content = "<p class=\"title\">"+ponto.nome+"</p>";
 			var content = content + "<p><b>Cardápio</b>: <a href="+ponto.site+">lemenu.com.br/"+ponto.nome+"</a></p>";
 			var content = content + "<p><b>Aceita: </b>"+ponto.formas_pagamento+"</p>";
 			var content = content + "<p><b>Telefone</b>: "+ponto.telefone+"</p>";
 			var content = content + "<p><b>Situação</b>: "+ponto.status+"</p>";

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(ponto.Latitude, ponto.Longitude),
                title: ponto.nome,
                map: map,
                icon: 'img/red-icon-map.png'
            });
 			
 			markers.push(marker);
 			
			google.maps.event.addListener(marker, 'click', (function(marker, i) {
			    return function() {
			        infowindow.setContent(ponto.nome);
			        infowindow.open(map, marker);
			    }
			})(marker))

			var myOptions = {
		        content: content,
		        pixelOffset: new google.maps.Size(-150, 0)
		    };
		 
		    infoBox[ponto.id] = new InfoBox(myOptions);
		    infoBox[ponto.id].marker = marker;
		 
		    infoBox[ponto.id].listener = google.maps.event.addListener(marker, 'click', function (e) {
		        abrirInfoBox(ponto.id, marker);
		    });
        });
 
 		var markerCluster = new MarkerClusterer(map, markers);
    });
 
}

function carregarNoMapa(endereco) {
    geocoder.geocode({ 'address': endereco + ', Brasil', 'region': 'BR' }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                var latitude = results[0].geometry.location.lat();
                var longitude = results[0].geometry.location.lng();

                $('#txtEndereco').val(results[0].formatted_address);
                $('#txtLatitude').val(latitude);
                $('#txtLongitude').val(longitude);

                var location = new google.maps.LatLng(latitude, longitude);
                marker.setPosition(location);
                map.setCenter(location);
                map.setZoom(16);
            }
        }
    });
}

function atualiazrMarcador(){
	google.maps.event.addListener(marker, 'drag', function () {
        geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) { 
                    $('#txtEndereco').val(results[0].formatted_address);
                    $('#txtLatitude').val(marker.getPosition().lat());
                    $('#txtLongitude').val(marker.getPosition().lng());
                }
            }
        });
    });
}

function autoComplete(){
	$("#txtEndereco").autocomplete({
        source: function (request, response) {
            geocoder.geocode({ 'address': request.term + ', Brasil', 'region': 'BR' }, function (results, status) {
                response($.map(results, function (item) {
                    return {
                        label: item.formatted_address,
                        value: item.formatted_address,
                        latitude: item.geometry.location.lat(),
                        longitude: item.geometry.location.lng()
                    }
                }));
            })
        },
        select: function (event, ui) {
            $("#txtLatitude").val(ui.item.latitude);
            $("#txtLongitude").val(ui.item.longitude);
            var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
            marker.setPosition(location);
            map.setCenter(location);
            map.setZoom(16);
        }
    });
}

function autoComplete2Places(){	
	$("#txtEnderecoPartida, #txtEnderecoChegada").autocomplete({
        source: function (request, response) {
            geocoder.geocode({ 'address': request.term + ', Brasil', 'region': 'BR' }, function (results, status) {
                response($.map(results, function (item) {
                    return {
                        label: item.formatted_address,
                        value: item.formatted_address,
                        latitude: item.geometry.location.lat(),
                        longitude: item.geometry.location.lng()
                    }
                }));
            })
        }
    });
}

function setLocation(){
	if (navigator.geolocation) { // Se o navegador do usuário tem suporte ao Geolocation
		navigator.geolocation.getCurrentPosition(function (position) {
	 
	    pontoPadrao = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); // Com a latitude e longitude que retornam do Geolocation, criamos um LatLng
	    map.setCenter(pontoPadrao);
	   
	    var geocoder = new google.maps.Geocoder();
	   
	    geocoder.geocode({ // Usando nosso velho amigo geocoder, passamos a latitude e longitude do geolocation, para pegarmos o endereço em formato de string
	    	"location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
	    	},
	    	function(results, status) {
	        	if (status == google.maps.GeocoderStatus.OK) {
	            	$("#txtEnderecoPartida").val(results[0].formatted_address);
	         	}
	      	});
	   	});
	}
}

function traceRoute(){
	$("form").submit(function(event) {
	   	event.preventDefault();
	 
	   	var transporte = $('#txtMeioTransporte').val();
	   	var travelMode;
	   	if (transporte == 'DRIVING') {travelMode = google.maps.TravelMode.DRIVING}
	   	if (transporte == 'BICYCLING') {travelMode = google.maps.TravelMode.BICYCLING}
	   	if (transporte == 'TRANSIT') {travelMode = google.maps.TravelMode.TRANSIT}
	   	if (transporte == 'WALKING') {travelMode = google.maps.TravelMode.WALKING}
		
	  	var enderecoPartida = $("#txtEnderecoPartida").val();
	   	var enderecoChegada = $("#txtEnderecoChegada").val();
	 	 
	 	$("#mapa").css("width", "70%");
	 	$("#mapa").css("float", "left");
	 	$("#trajeto-texto").css("display", 'block');
	 	$("#trajeto-texto").css("overflow", 'scroll');

	   	var request = { // Novo objeto google.maps.DirectionsRequest, contendo:
	    	origin: enderecoPartida, // origem
	      	destination: enderecoChegada, // destino
	      	travelMode: travelMode // meio de transporte, nesse caso, de carro
	   	};
	 
	   	directionsService.route(request, function(result, status) {
	     	if (status == google.maps.DirectionsStatus.OK) { // Se deu tudo certo
	         	directionsDisplay.setDirections(result); // Renderizamos no mapa o resultado
	      	}
	   	});
	});
}

$(document).ready(function () {
	autoComplete();
	autoComplete2Places();
	setLocation();
    initialize();
	carregarPontos();
	atualiazrMarcador();
	traceRoute();

	$("#btnEndereco").click(function() {
        if($(this).val() != "")
            carregarNoMapa($("#txtEndereco").val());
    })
 
    $("#txtEndereco").blur(function() {
        if($(this).val() != "")
            carregarNoMapa($(this).val());
    })
});

// AIzaSyA-n86zYAHwv4_6jCXf70FRnlRR18kzIEE

$(document).ready(function() {
    // Initialize the map with default location
    initMap();
    $('#apply-filters').click(function() {
var locationFilter = $('#location-filter').val();
var typeFilter = $('#type-filter').val();
var maxPrice = parseFloat($('#price-filter').val()) || Infinity;

$('.product-item').each(function() {
    var itemLocation = $(this).data('location');
    var itemType = $(this).data('type');
    var itemPrice = parseFloat($(this).data('price').replace('$', ''));

    // Check if the item matches the filters
    var matchesLocation = locationFilter === '' || itemLocation === locationFilter;
    var matchesType = typeFilter === '' || itemType === typeFilter;
    var matchesPrice = itemPrice <= maxPrice;

    // Show or hide the item based on filter criteria
    if (matchesLocation && matchesType && matchesPrice) {
        $(this).show();
    } else {
        $(this).hide();
    }
});
});
    function generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }

    function generateProductItems(numItems) {
const container = document.getElementById('product-grid');
const locations = [
'Ավան', 'Զեյթուն', 'Բանգլադեշ', '3-րդ Մաս', 'Կոմիտաս',
'Էրեբունի', 'Նորագավիթ', 'Շենգավիթ'
];
const types = ['Indica', 'Sativa']; // Product types

const baseLat = 40.177200; // Center of Yerevan
const baseLng = 44.503490; // Center of Yerevan
const latOffset = 0.02; // Adjust offset to cover a larger area
const lngOffset = 0.02; // Adjust offset to cover a larger area

// Array of image URLs
const images = [
'https://thenaturalremedy.store/wp-content/uploads/2024/06/jkbhkkghygvh-600x600.png',
'https://thenaturalremedy.store/wp-content/uploads/2024/05/dosi-platinum-2-600x600.png',
'https://thenaturalremedy.store/wp-content/uploads/2024/05/Frankies-1-600x600.png',
'https://thenaturalremedy.store/wp-content/uploads/2020/12/new-weed-2-1-300x300.png',
'https://thenaturalremedy.store/wp-content/uploads/2020/09/cmass-removebg-e1657104210586.png'
];

for (let i = 0; i < numItems; i++) {
const lat = baseLat + (Math.random() - 0.5) * latOffset * 2; // Spread over a larger area
const lng = baseLng + (Math.random() - 0.5) * lngOffset * 2; // Spread over a larger area
const color = generateRandomColor();
const quantity = Math.floor(Math.random() * 100) + 1; // Random quantity for demonstration
const location = locations[Math.floor(Math.random() * locations.length)];
const type = types[Math.floor(Math.random() * types.length)];

// Generate a random price between $25 and $45
const price = (Math.random() * (45 - 25) + 25).toFixed(2);

// Choose a random image URL
const image = images[Math.floor(Math.random() * images.length)];

const productItem = document.createElement('div');
productItem.className = 'product-item';
productItem.setAttribute('data-name', `Product ${i + 1}`);
productItem.setAttribute('data-price', `$${price}`);
productItem.setAttribute('data-description', `Description for Product ${i + 1}`);
productItem.setAttribute('data-image', image);
productItem.setAttribute('data-lat', lat.toFixed(6));
productItem.setAttribute('data-lng', lng.toFixed(6));
productItem.setAttribute('data-color', color);
productItem.setAttribute('data-quantity', quantity);
productItem.setAttribute('data-location', location);
productItem.setAttribute('data-type', type);

productItem.innerHTML = `
    <div class="product-price">$${price}</div>
    <img src="${image}" alt="Product ${i + 1} Image">
    <div class="product-specific">
        <div class="product-name">Աապրանք ${i + 1}</div>
        <div class="product-location">${location}</div>
        <div class="product-type">${type}</div>
    </div>
    <button class="buy-button">Գնել</button>
`;

container.appendChild(productItem);
}
}

generateProductItems(100);

    $('.product-item').click(function() {
        var name = $(this).data('name');
        var price = $(this).data('price');
        var description = $(this).data('description');
        var image = $(this).data('image');
        var lat = parseFloat($(this).data('lat'));
        var lng = parseFloat($(this).data('lng'));

        $('#product-name').text(name);
        $('#product-price').text(price);
        $('#product-description').text(description);
        $('#product-image').attr('src', image);

        // Optionally update the map location and add GeoJSON layer
        initMap(lat, lng);

        $('#overlay').fadeIn();
        $('#product-details-menu').fadeIn();
    });

    $('#close-btn').click(function() {
        $('#product-details-menu').hide();
        $('#overlay').hide();
    });

    $('#overlay').click(function() {
        $('#product-details-menu').fadeOut();
        $('#overlay').fadeOut();
    });

    // Handle "Buy" button click
    $(document).on('click', '.buy-button', function() {
        var price = $(this).siblings('.product-price').text().replace('$', '');
        var dashAddress = 'XdAUmwtig27HBG6WfYyHAzP8n6XC9jESEw';
        var conversionRate = 0.05; // Example conversion rate from USD to DASH
        var amountInDASH = parseFloat(price) * conversionRate;

        // Get product details
        var productImage = $(this).siblings('img').attr('src');
        var productName = $(this).siblings('.product-specific').find('.product-name').text();
        var productPrice = $(this).siblings('.product-price').text();

        // Update modal with product details
        $('#address').text(dashAddress);
        $('#amount-value').text(amountInDASH.toFixed(2));
        $('#product-image').attr('src', productImage);
        $('#product-name').text(productName);
        $('#product-price').text(productPrice);

        // Show loading animation
        $('#loading-animation').show();
        $('#qr-code').hide();

        // Generate QR Code for DASH address
        var qr = qrcode(0, 'L');
        qr.addData(dashAddress);
        qr.make();
        $('#qr-code').html(qr.createImgTag(4));

        // Hide loading animation and show QR code
        $('#loading-animation').hide();
        $('#qr-code').show();

        // Open the modal
        $('#payment-modal').fadeIn();
    });

    // Close the modal
    $('.close-btn').click(function() {
        $('#payment-modal').fadeOut();
    });

    $('#payment-modal').click(function(event) {
        if ($(event.target).is('#payment-modal')) {
            $('#payment-modal').fadeOut();
        }
    });

});

function initMap(lat = 40.177200, lng = 44.503490) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibnVibWFzdGVyNjY2IiwiYSI6ImNseXVpN2cxNDByMHUybHNnOHZpcGppMHcifQ.n8AzCR_WFx-YDwy7G6z7Hg';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [lng, lat],
        zoom: 15
    });

    map.on('load', function () {
        var features = [];

        $('.product-item').each(function() {
            var lat = parseFloat($(this).data('lat'));
            var lng = parseFloat($(this).data('lng'));
            var color = $(this).data('color');
            var quantity = $(this).data('quantity');

            // Define the range for random distances in meters
            const minDistanceMeters = 50;
            const maxDistanceMeters = 150;

            // Generate a random distance for each polygon
            const distanceMeters = getRandomDistance(minDistanceMeters, maxDistanceMeters);
            const radiusDegrees = distanceMeters * 0.00001;

            // Calculate polygon coordinates
            function generateCircleCoordinates(lng, lat, radius, points = 30) {
                const coordinates = [];
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * 2 * Math.PI;
                    const offsetLng = radius * Math.cos(angle);
                    const offsetLat = radius * Math.sin(angle);
                    coordinates.push([
                        lng + offsetLng,
                        lat + offsetLat
                    ]);
                }
                coordinates.push(coordinates[0]); // Close the polygon
                return coordinates;
            }

            const coordinates = generateCircleCoordinates(lng, lat, radiusDegrees);

            features.push({
                "type": "Feature",
                "properties": {
                    "title": $(this).data('name'),
                    "color": color,
                    "quantity": quantity
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coordinates]
                }
            });

            // Add a marker for each product
            new mapboxgl.Marker({ color: color })
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup().setHTML(`
                    <h3>${$(this).data('name')}</h3>
                    <p>Price: ${$(this).data('price')}</p>
                    <p>Description: ${$(this).data('description')}</p>
                `))
                .addTo(map);
        });

        var geojsonData = {
            "type": "FeatureCollection",
            "features": features
        };

        // Add GeoJSON data as a source on the map
        map.addSource('products', {
            'type': 'geojson',
            'data': geojsonData
        });

        // Add the fill layer for circular outlines
        map.addLayer({
            'id': 'products-outline',
            'type': 'fill',
            'source': 'products',
            'layout': {},
            'paint': {
                'fill-color': [
                    'case',
                    ['has', 'color'],
                    ['get', 'color'],
                    '#00f' // Default color if not specified
                ],
                'fill-opacity': 0.3,
                'fill-outline-color': '#000'
            }
        });

        // Add labels for quantities
        map.addLayer({
            'id': 'products-labels',
            'type': 'symbol',
            'source': 'products',
            'layout': {
                'text-field': '{quantity}', // Display quantity
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
            'paint': {
                'text-color': '#000000'
            }
        });

        // Add a click event listener to display popup
        map.on('click', 'products-outline', (e) => {
            var coordinates = e.features[0].geometry.coordinates[0][0];
            var title = e.features[0].properties.title;
            var quantity = e.features[0].properties.quantity;

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML('<strong>' + title + '</strong><br>Quantity: ' + quantity)
                .addTo(map);
        });
    });

    // Function to generate random distance within a range
    function getRandomDistance(min, max) {
        return Math.random() * (max - min) + min;
    }
}

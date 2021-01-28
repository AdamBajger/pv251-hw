// old values for the Oslo data
/*var bounds = [253700, 6637800, 273800, 6663700], // UTM 33N left, bottom, right, top
    boundsWidth = bounds[2] - bounds[0],
    boundsHeight = bounds[3] - bounds[1],
    cellSize = 100,
    xCells = boundsWidth / cellSize,
    yCells = boundsHeight / cellSize,
    sceneWidth = 100,
    sceneHeight = 100 * (boundsHeight / boundsWidth),
    boxSize = sceneWidth / xCells,
    valueFactor = 0.02,
    width  = window.innerWidth,
    height = window.innerHeight;*/

var bounds = [11.9970444,48.4062989,18.9689,51.2086567],//[12.18, 48.16, 18.91, 50.88], // UTM 33N left, bottom, right, top
    boundsWidth = bounds[2] - bounds[0],
    boundsHeight = bounds[3] - bounds[1],
    /*shiftX = 0,
    shiftY = 0,
    scalingX = 1,
    scalingY = 1,*/
    //xCells = boundsWidth / cellSize,
    //yCells = boundsHeight / cellSize,
    sceneWidth = 100,
    sceneHeight = 100 * (boundsHeight / boundsWidth),
    boxSize = 0.1,//sceneWidth / xCells,
    valueFactor = 0.1,
    width  = window.innerWidth*0.75,
    height = window.innerHeight;

var colorScale = d3.scale.linear()
    .domain([0, 50, 150, 250])
    .range(['#000000', '#aa0d1c', '#fdfd00', '#aaffff']);

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 20, width / height, 0.1, 1000 );
camera.position.set(0, -200, 120);

var controls;

var renderer = new THREE.WebGLRenderer();

renderer.setSize(width, height);
renderer.domElement.id = "RENDERER-ID";



var geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight, 1, 1),
    material = new THREE.MeshBasicMaterial(),
    plane = new THREE.Mesh(geometry, material);

var textureLoader = new THREE.TextureLoader();
textureLoader.load('data/czechia-hd-map.jpg', function(texture) {
    material.map = texture;
    scene.add(plane);
});

var ambLight = new THREE.AmbientLight(0x777777);
scene.add(ambLight);

var dirLight = new THREE.DirectionalLight(0xcccccc, 1);
dirLight.position.set(-70, -50, 80);
scene.add(dirLight);


function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

window.onload = function () {
    let canvasContainer = document.getElementById("canvas-container")

    canvasContainer.appendChild( renderer.domElement );
    controls = new THREE.TrackballControls(camera, canvasContainer);
    render();
};





// Here we parse the data and add cubes for each record (Filtering is under construction)
/*var csv = d3.dsv(' ', 'text/plain');
csv('data/Oslo_bef_100m_2015.csv').get(function(error, data) { // ru250m_2015.csv
    // Go over every datapoint
    for (var i = 0; i < data.length; i++) {
        // variables for extracting data from the original dataset. Obviously I am not starting from scratch (technically)
        // I have to completely rewrite the rendering system, but at least this app showed me how to make the scene and stuff
        var id = data[i].rute_100m,
            utmX = parseInt(id.substring(0, 7)) - 2000000 + cellSize, // First seven digits minus false easting
            utmY = parseInt(id.substring(7, 14)) + cellSize, // Last seven digits
            sceneX = (utmX - bounds[0]) / (boundsWidth / sceneWidth) - sceneWidth / 2,
            sceneY = (utmY - bounds[1]) / (boundsHeight / sceneHeight) - sceneHeight / 2,
            value = parseInt(data[i].sum);

        console.log("SCENE: ", sceneX, sceneY);
        var geometry = new THREE.BoxGeometry(boxSize, boxSize, value * valueFactor);

        var material = new THREE.MeshPhongMaterial({
            color: colorScale(value)
        });

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(sceneX, sceneY, value * valueFactor / 2);

        scene.add(cube);
    }
});*/

var csvParser = d3.dsv(',', 'text/plain');
csvParser('data/pavouci-lofi-grouped-summed.csv').get(function(error, data) { // pavouci.csv
    // use precomputed values for map bounds, datapoint geometry sizes and stuff
    var max = 0;

    // Go over every datapoint
    for (var i = 0; i < data.length/4; i++) {
        // variables for extracting data from the original dataset. Obviously I am not starting from scratch (technically)
        // I have to completely rewrite the rendering system, but at least this app showed me how to make the scene and stuff
        var id = i, // We will be indexing by the row number, cuz we dont have any other way in the data
            utmX = parseFloat(data[i]['delka']), // Recorded geographical latitude
            utmY = parseFloat(data[i]['sirka']), // Recorded geographical longitude
            utmZ = parseFloat(data[i]['vyska']), // Recorded geographical altitude (above sea level)
            // What the fuck?
            sceneX = (utmX - bounds[0]) / (boundsWidth / sceneWidth) - sceneWidth / 2 ,
            sceneY = (utmY - bounds[1]) / (boundsHeight / sceneHeight) - sceneHeight / 2 ,
            counts = [parseInt(data[i]['samec']),parseInt(data[i]['samice']),parseInt(data[i]['juv']),parseInt(data[i]['ex'])];
            /*countMale = parseInt(data[i]['samec']), // number of males
            countFemale = parseInt(data[i]['samice']), // number of females
            countJuveniles = parseInt(data[i]['juv']), // number of younglings
            countUnidentified = parseInt(data[i]['ex']); // number of unidentified samples*/
        for (var c = 0; c < counts.length;c++) {
            if (isNaN(counts[c])) {
                counts[c] = 0;
            }
        }
        // This determines the box color on the defined scale (I swear I saw it defined somewhere above)
        // TODO: split boxes into four subboxes (for each thing separately)
        var value = counts.reduce(function(cum, cur){return cum+cur;}); // Array.prototype.reduce hack to sum teh array
        if(value === 0) {
            continue;
        }
        if(value > max){
            max = value;
        }


        //console.log("X ","(",utmX," - ",bounds[0],") / (",boundsWidth,"/",sceneWidth,") - ",sceneWidth," / 2 = ",sceneX);
        //console.log("Y: ","(",utmY," - ",bounds[1],") / (",boundsHeight,"/",sceneHeight,") - ",sceneHeight," / 2 = ",sceneY);

        var geometry = new THREE.BoxGeometry(boxSize, boxSize, value * valueFactor);

        var material = new THREE.MeshPhongMaterial({
            color: colorScale(value)
        });

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(sceneX, sceneY, value * valueFactor / 2 + 0.01);

        scene.add(cube);
    }
    /*var testGeometry = new THREE.BoxGeometry(1, 1, 1);
    var testMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.5});
    var testCube = new THREE.Mesh(testGeometry, testMaterial);
    testCube.position.set(10, 1, 1);

    scene.add(testCube);*/
    console.log(max);
});
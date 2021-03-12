


var bounds = [11.9970444,48.4062989,18.9689,51.2086567],// GPS bounds of the actual picture (left, bottom, right, top)
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
    boxSize = 0.25,//sceneWidth / xCells,
    valueFactor = 0.1,
    width  = window.innerWidth*0.75,
    height = window.innerHeight;

var colorScale = d3.scale.linear()
    .domain([0, 40, 400])
    .range(['#000000', '#aa0d1c', '#ff00ff']),
    v_highlight_color = '#0ff000';


if(undefined === THREE) {
    window.alert("The THREE library is somehow not defined. Idk what is wrong, but something definitely is. Feel free to cry");
    var THREE = require("../lib/three.min");
}

if(undefined === Set) {
    window.alert("Your browser does not implement the Set data structure. Use Firefox or Chrome or smth, idk, or this app will proably not work.");
    var Set =  function () {};
}

var camera = new THREE.PerspectiveCamera( 20, width / height, 0.2, 1000 );
camera.position.set(0, -200, 120);

var controls;

var renderer = new THREE.WebGLRenderer();

renderer.setSize(width, height);
renderer.domElement.id = "RENDERER-ID";

var global_scene = new THREE.Scene();

var geometry = new THREE.PlaneGeometry(sceneWidth, sceneHeight, 1, 1),
    material = new THREE.MeshBasicMaterial(),
    plane = new THREE.Mesh(geometry, material);

var textureLoader = new THREE.TextureLoader();
textureLoader.load('data/czechia-hd-map.jpg', function(texture) {
    material.map = texture;
    global_scene.add(plane);
});

var ambLight = new THREE.AmbientLight(0x777777);
global_scene.add(ambLight);

var dirLight = new THREE.DirectionalLight(0xcccccc, 1);
dirLight.position.set(-70, -50, 80);
global_scene.add(dirLight);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
var canvasContainer;

function onMouseMove( event ) {

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    mouse.x = ( event.clientX / width ) * 2 - 1;
    mouse.y = - ( event.clientY / height ) * 2 + 1;

}

var v_color_before_highlighting = null;
var v_last_highlighted_object = null;
function render() {
    controls.update();
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate intersection only when the controls are idle to save memory and make things less chaotic
    if(controls.isIdle() && !v_tooltip_frozen){

        // calculate objects intersecting the picking ray
        const intersects = $(canvasContainer).is(':hover') ? raycaster.intersectObjects( global_cube_array ) : [];

        const current_object = intersects.length > 0 ? intersects[0].object : null;  // reference the current highlighted object
        // if currently highlighted object is different from the highlighted object from the last frame
        if (current_object !== v_last_highlighted_object ) {
            // and we had an object highlighted in the previous frame
            if(null !== v_last_highlighted_object) {
                // reset the texture of the previous highlighted object
                v_last_highlighted_object.material.color.set(v_color_before_highlighting);
            }
            var _detail = null;
            // if we have a non-null object highlighted
            if(null !== current_object) {
                //console.log(current_object.userData);
                _detail = current_object.userData;
                v_last_highlighted_object = current_object;  // store the reference on it
                v_color_before_highlighting = v_last_highlighted_object.material.color.getHex();  // store its original color
                current_object.material.color.set( v_highlight_color );  // change the color of the highlighted object
            } else {
                // or if we are highlighting null object (no object under the mouse), null everything
                v_last_highlighted_object = null;
                v_color_before_highlighting = null;
            }
            // dispatch highlight event on the document

                document.getElementById("canvas-container").dispatchEvent(new CustomEvent("object-highlighted", {
                    detail: _detail,
                    cancelable: true
                }));
            }

    }

    requestAnimationFrame(render);
    renderer.render(global_scene, camera);
}


// this array keeps the geometries visualizes, so we can access them later and modify them
var global_cube_array = [];
var global_data;
var f_oldest_date = moment(0);
var f_newest_date = moment.now();


var f_all_available_species = new Set();
//var f_displayble_species = new Set();
var f_all_available_biotops = {};  // using dictionary here might seem unnecessary, but it might come handy in the future
//var f_displayable_biotops = new Set();
//var f_all_available_sexes = [true, true, true, true];

function parseData(error, data ) {
    // use precomputed values for map bounds, datapoint geometry sizes and stuff to parse the data
    // parse dates
    data.forEach(function (d) {
        var date = moment(d['datumdo'], "DD.MM.YYYY");
        if(date < f_oldest_date) {
            f_oldest_date = date;
        }
        if(date > f_newest_date) {
            f_newest_date = date;
        }
        d['datumdo'] = date;
        if(!f_all_available_species.has(d['nazev'])) {
            f_all_available_species.add(d['nazev']);
        }
        if(!f_all_available_biotops.hasOwnProperty(d['kodbiotopu'])) {
            f_all_available_biotops[d['kodbiotopu']] = d['biotop'];
        }
        var _labels = ['samec', 'samice', 'ex', 'juv', 'vyska'];
        for(var _l =0; _l <_labels.length; _l++) {
            //console.log(_labels[_l]);
            d[_labels[_l]] = +d[_labels[_l]];
        }

    });
    console.log(f_all_available_biotops);

    global_data = data;
    //data = data.filter(function(d){return });

    visualize_data(global_data);
    update_available_species(f_all_available_species);
    update_available_biotops(Object.keys(f_all_available_biotops));

}

// this encapsulates the nesting functions for key parameter in the D3.nest so it can be used dynamically
function createNestingFunction(propertyName){
    return function(d){
        return d[propertyName];
    };
}

function visualize_data(data, date_first, date_last, displayed_species, sexes, displayed_biotops) {

    // default filter settings
    if(undefined===date_first) {
        date_first = f_oldest_date;
    }
    if (undefined === date_last ) {
        date_last = f_newest_date;
    }
    if (undefined === displayed_species) {
        displayed_species = f_all_available_species;
    }
    if(undefined === sexes) {
        sexes = [true, true, true, true];
    }
    if (undefined === displayed_biotops) {
        displayed_biotops = new Set(Object.keys(f_all_available_biotops));
    }

    console.log(data.length);
    // filter out data that are not requested by user
    data = data.filter(function(d) { return (date_first <= d['datumdo']) && (date_last >= d['datumdo']);}); // filter by date
    data = data.filter(function(d) { return displayed_species.has(d['nazev']);}); // filter species
    data = data.filter(function(d) { return displayed_biotops.has(d["kodbiotopu"]);});
    console.log(data.length);

    // I am not proud of this nasty nest hacking, but D3 is the only way to go and it just sucks, when you are not used to it
    var g_levels = ['sirka', 'delka'];
    var nest = d3.nest();
    for (var k = 0; k < g_levels.length; k++) {
        nest = nest.key( createNestingFunction(g_levels[k]) );
        //create a new nesting function that has one more key function added
        //and save it in the variable

        //the function `createNestingFunction` is called *immediately*
        //with a parameter based on the current value of `i`
        //the returned function will always use that parameter,
        //regardless of how many times createNestingFunction is called
    }


    //var grouped_data = nest.entries(data);  // compute the nest
    //console.log(grouped_data);

    // here we rollup data based on the grouping and we retain only the necessary informations
    var rolled_data = nest.rollup(function(entry) {
        var parsed_entry = {
            "samec": 0,
            "samice": 0,
            "juv": 0,
            "ex": 0,
            "vyska": 0,
            "nazvy": new Set(),
            "kodybiotopu": new Set()
        };

        var total = 0;
        // we loop over the grouped entries only once
        entry.forEach(function (d) {
            //console.log(d);
            parsed_entry["samec"] += d["samec"];
            parsed_entry["samice"] += d["samice"];
            parsed_entry["juv"] += d["juv"];
            parsed_entry["ex"] += d["ex"];
            parsed_entry["vyska"] += d["vyska"];
            parsed_entry["nazvy"].add(d["nazev"]);
            parsed_entry["kodybiotopu"].add(d["kodbiotopu"]);
            total++;
        });
        // now we need to correct the height. We want average height, not the sum of heights
        parsed_entry["vyska"] /= total;
        // return the new datapoint
        return parsed_entry;
    }).entries(data);
    //console.log(rolled_data);

    var data_back_to_normal = [];
    //console.log(Object.keys(rolled_data));

        for(var _sirka = 0; _sirka < rolled_data.length; _sirka++) {
            //console.log(_nazev + _sirka.toString());
            for(var _delka = 0; _delka < rolled_data[_sirka].values.length; _delka++) {
                 // FUCK D3. Zlatý Python. Javascript je čiré zlo.
                        // ano, mohl bych vymýšlet elegantní rekurzivní funkce, abych to udělal hezčí, ale na to fakt nemám čas.
                        var entry = rolled_data[_sirka].values[_delka].values;
                        //entry["nazev"] = rolled_data[_nazev].key;
                        entry["sirka"] = rolled_data[_sirka].key;
                        entry["delka"] = rolled_data[_sirka].values[_delka].key;
                        //entry["kodbiotopu"] = rolled_data[_sirka].values[_delka].values[_kodbiotopu].key;
                        //entry["biotop"] = rolled_data[_sirka].values[_delka].values[_kodbiotopu].values[_biotop].key;
                        //console.log(entry);
                        data_back_to_normal.push(entry)
                    }

        }


    console.log(data_back_to_normal.length);

    data = data_back_to_normal;

    // visualisation part - no more processing
    //var f_displayble_species = new Set();
    //var f_displayable_biotops = new Set();
    var max = 0;
    // Go over every datapoint (up to a limit TODO{ remove a limit} )
    for (var i = 0; i < data.length; i++) {
        // variables for extracting data from the original dataset. Obviously I am not starting from scratch (technically)
        // I have to completely rewrite the rendering system, but at least this app showed me how to make the scene and stuff
        var// id = i,
            // TODO: Do we need GPS data to be strings for grouping reasons?? Cant we do parseFloat earlier in the code?
            utmX = parseFloat(data[i]['delka']), // Recorded geographical latitude
            utmY = parseFloat(data[i]['sirka']), // Recorded geographical longitude
            //utmZ = parseFloat(data[i]['vyska']), // Recorded geographical altitude (above sea level)
            // What the fuck?
            sceneX = (utmX - bounds[0]) / (boundsWidth / sceneWidth) - sceneWidth / 2 ,
            sceneY = (utmY - bounds[1]) / (boundsHeight / sceneHeight) - sceneHeight / 2 ,
            counts = [
                parseInt(data[i]['samec']),  // number of males
                parseInt(data[i]['samice']),  // number of females
                parseInt(data[i]['juv']),  // number of younglings
                parseInt(data[i]['ex'])  // number of unidentified exemplars
            ];

        var value = 0;
        for (var c = 0; c < counts.length;c++) {
            if (!isNaN(counts[c]) && sexes[c]) {
                value += counts[c];
            }
        }
        // This determines the box color on the defined scale (I swear I saw it defined somewhere above)
        // TODO: split boxes into four subboxes (for each thing separately)
        /*var value = 0
        for(c = 0; c < counts.length)
            counts.reduce(function(cum, cur){ // Array.prototype.reduce hack to sum teh array
            if()return cum+cur;
        }); */
        if(value === 0) {
            console.log("Skipped");
            continue;

        }
        if(value > max){
            max = value;
        }

        var cube_height = Math.sqrt(value * valueFactor);
        // this sets the geometry used for the created objects
        var geometry = new THREE.BoxGeometry(boxSize, boxSize, cube_height);

        // this will determine the lighting and rendering of the faces of the created object
        var material = new THREE.MeshPhongMaterial({
            // we have a particular colorscale prepared
            color: colorScale(value)
        });

        // here we declare the object, that will be rendered, based on the material and geometry declared earlier
        var cube = new THREE.Mesh(geometry, material);
        cube.userData = data[i];
        cube.position.set(sceneX, sceneY, cube_height / 2 + 0.01);  // set the object position

        global_scene.add(cube);

        global_cube_array.push(cube);
    }
    console.log("Visualisation loaded");
}


window.onload = function () {
    canvasContainer = document.getElementById("canvas-container");

    canvasContainer.appendChild( renderer.domElement );
    controls = new THREE.TrackballControls(camera, canvasContainer);
    render();
    //window.requestAnimationFrame(render);
};

window.addEventListener( 'mousemove', onMouseMove, false );

// handle resize event
window.onresize = function (/*ev*/) {
    console.log("Handling resize event is not supported");
    /*width  = window.innerWidth*0.75;
    height = window.innerHeight;
    const last_position = camera.position.value;
    camera = new THREE.PerspectiveCamera( 20, width / height, 0.1, 1000 );
    //camera.position.set(last_position);
    camera.position.set(0, -200, 120);
    renderer.setSize(width, height);*/
};

// Here we specify the path to the CSV source file
var csvParser = d3.dsv(',', 'text/plain');
csvParser('data/pavouci-dummy-refined.csv').get(parseData);

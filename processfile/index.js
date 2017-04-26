var fs = require('fs');
var shp = require('shp');
var AdmZip = require('adm-zip');

module.exports = function (context, tempFile) {
    var filename = context.bindingData.name;
    context.log('Process the temporary file:', filename);
    
    // Already deserialized from JSON format 
    var gson = (tempFile);

    var points = getPoints(gson);

    var header = 'timestamp,coord0,coord1,lat,lon,rate,target\n';
    var lines = points.map( p => {
        return `${p.timestamp},${p.coordinates[0]},${p.coordinates[1]},${p.antennaLat},${p.antennaLon},${p.rate},${p.targetRate}`;
    });

    var output_content = header + lines.join('\n');

    context.log('Generate CSV output');
    context.bindings.outputBlob = output_content;
    
    context.done();

};

function getPoints(gson) {
    
    return gson.features.map( feat => {

        var polygon = feat.geometry;
        var properties = feat.properties;
        var point = {};
        var c;

        if(feat.geometry.type == "Polygon") {
            c = centroid(polygon.coordinates[0]);
        } else {
            c = polygon.coordinates;
        }

        point = {
            coordinates: c,
            timestamp: Number(properties.timestamp),
            areaSqM: Number(properties.areaSqM),
            cog: Number(properties.cog), 
            sogMperSec: Number(properties.sogMperSec),
            elevM: Number(properties.elevM),
            antennaLat: Number(properties.antennaLat),
            antennaLon: Number(properties.antennaLon),
            rate: Number(properties.rate),
            targetRate: Number(properties.targetrate),
            ha: Number(properties.ha) 
        };

        return point;
    });

}

function centroid(coordinates) {
    var total = 0;
    var x = 0;
    var y = 0;

    try {
        coordinates.map( c => {
            x += c[0];
            y += c[1];
            total++;
        });

    }
    catch(err) {
        context.log('error');
    }

    var result = [x/total, y/total];

    return result;
}
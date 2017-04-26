var fs = require('fs');
var shp = require('shp');
var AdmZip = require('adm-zip');

module.exports = function (context, zipFile) {
    var filename = context.bindingData.name;

    context.log("RECEIVEFILE: Received file for processing\n  Name:", filename, "\n   Size:", zipFile.length, "Bytes");

    var outputFolder = 'D:\\home\\site\\data\\';
    var tempFile = outputFolder + filename;

    // copy the file to local folder
    context.log("Write ZIP file: ", tempFile);
    fs.writeFileSync(tempFile, zipFile, 'binary')

    // unzip the file
    context.log("Unzip file to ", outputFolder);
    var zip = new AdmZip(tempFile);    
    zip.extractAllTo(outputFolder);

    var shapeFile = tempFile;
    
    context.log("Read Shapefile ", shapeFile);
    shp.readFile(shapeFile, (err,gson) => {
        
        context.log("Convert to temporary output (JSON format)");
        var jsonFile = JSON.stringify(gson);

        context.bindings.outputFile = jsonFile;

        // var points = getPoints(gson);

        // var header = 'coord0,coord1,lat,lon,rate,target\n';
        // var lines = points.map( p => {
        //    return `${p.coordinates[0]},${p.coordinates[1]},${p.antennaLat},${p.antennaLon},${p.rate},${p.targetRate}`;
        //});

        context.done();

    });    


};


function getPoints(gson) {
    
    return gson.features.map( feat => {
            var polygon = feat.geometry;
            var properties = feat.properties;

            var c = centroid(polygon.coordinates[0]);

            var point = {
                coordinates: centroid(polygon.coordinates[0]),
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
        }
    );

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
        console.log('error');
    }

    var result = [x/total, y/total];

    return result;
}
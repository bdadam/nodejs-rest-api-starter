const path = require('path');
const DB = require('nedb');

module.exports = {
    vehicleDB: new DB({
        filename: path.join(process.env.DB_DIRECTORY || 'data', 'vehicles.nedb'),
        autoload: true,
        inMemoryOnly: !process.env.DB_DIRECTORY,
        timestampData: true
    })
};
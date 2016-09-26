const path = require('path');
const DB = require('nedb');

module.exports = {
    vehicleDB: new DB({
        filename: path.join(process.env.DATA_PATH || 'data', 'vehicles.nedb'),
        autoload: true,
        inMemoryOnly: !process.env.DATA_PATH,
        timestampData: true
    })
};
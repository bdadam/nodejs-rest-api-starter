const Joi = require('joi');
const suspend = require('suspend');
const vehicleDB = require('../database').vehicleDB;

const find = suspend.promise(function*() {
    return yield vehicleDB.find({}).exec(suspend.resume());
});

const vehicleSchema = Joi.object().keys({
    title: Joi.string().required(),
    fuel: Joi.valid('gasoline', 'diesel'),
    price: Joi.number().integer(),
    new: Joi.boolean(),
    mileage: Joi.number().integer()
                .when('new', { is: false, then: Joi.required() })
                .when('new', { is: true, then: Joi.strip() }),
    firstregistration: Joi.date()
                .when('new', { is: false, then: Joi.required() })
                .when('new', { is: true, then: Joi.strip() })
});

const validateVehicle = (vehicle, cb) => vehicleSchema.validate(vehicle, { stripUnknown: true }, cb);

const create = suspend.promise(function*(vehicle) {
    const sanitizedVehicle = yield validateVehicle(vehicle, suspend.resume());
    return yield vehicleDB.insert(sanitizedVehicle, suspend.resume());
});

module.exports = {
    all() {
        return find();
    },

    getById(id) {
        return find({ _id: id }).then(results => {
            if (results.length <= 0) {
                throw new Error('Not found');
            }

            return results[0];
        });
    },

    insert(vehicle) {
        return create(vehicle);
    }
};
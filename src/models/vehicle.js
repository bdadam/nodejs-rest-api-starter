const Joi = require('joi');
const suspend = require('suspend');
const vehicleDB = require('../database').vehicleDB;

const find = suspend.promise(function*() {
    return yield vehicleDB.find({}).exec(suspend.resume());
});

const vehicleSchema = Joi.object().keys({
    title: Joi.string().required(),
    fuel: Joi.valid('gasoline', 'diesel').required(),
    price: Joi.number().integer().required(),
    new: Joi.boolean().required(),
    mileage: Joi.number().integer().required()
                .when('new', { is: true, then: Joi.strip() }),
    firstregistration: Joi.date().required()
                .when('new', { is: true, then: Joi.strip() })
}).options({ stripUnknown: true, abortEarly: false });

const create = suspend.promise(function*(vehicle) {
    const [validationErrors, sanitizedVehicle] = yield vehicleSchema.validate(vehicle, suspend.resumeRaw());

    if(validationErrors) {
        const err = new Error('Validation failed.');
        if (validationErrors.details) {
            err.messages = validationErrors.details.map(d => d.message);
        }

        throw err;
    }

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
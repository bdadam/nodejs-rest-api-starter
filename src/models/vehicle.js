const Joi = require('joi');
const suspend = require('suspend');
const vehicleDB = require('../database').vehicleDB;

const find = suspend.promise(function*(query) {
    return yield vehicleDB.find(query).exec(suspend.resume());
});

const findOne = query => find(query).then(results => {
    return (results && results[0]) || null;
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

const update = suspend.promise(function*(id, vehicle) {
    const [validationErrors, sanitizedVehicle] = yield vehicleSchema.validate(vehicle, suspend.resumeRaw());

    if(validationErrors) {
        const err = new Error('Validation failed.');
        if (validationErrors.details) {
            err.messages = validationErrors.details.map(d => d.message);
        }

        throw err;
    }

    sanitizedVehicle._id = id;

    yield vehicleDB.update({ _id: id }, sanitizedVehicle, { multi: false, upsert: true }, suspend.resume());

    return findOne({ _id: id });
});

const remove = suspend.promise(function*(id) {
    const docsRemoved = yield vehicleDB.remove({ _id : id }, suspend.resume());
    return docsRemoved === 1;
});

module.exports = {
    find(query) {
        return find(query);
    },
    findOne(query) {
        return find(query).then(results => {
            return (results && results[0]) || null;
        });
    },

    insert(vehicle) {
        return create(vehicle);
    },

    update(id, vehicle) {
        return update(id, vehicle);
    },

    remove(id) {
        return remove(id);
    }
};
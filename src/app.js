'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const Vehicle = require('./models/vehicle');

app.get('/api/vehicles/:id', (req, res) => {
    Vehicle.getById(req.params.id)
        .then(v => res.json(v))
        .catch(e => res.status(404).json(null));
});

app.get('/api/vehicles', (req, res) => {
    Vehicle.all()
        .then(vehicles => res.json(vehicles))
        .catch(err => res.status(404).json([]));
});

app.post('/api/vehicles', bodyParser.json(), (req, res) => {
    Vehicle.insert(req.body)
        .then(v => res.json(v))
        .catch(e => res.status(400).json(e));
});

module.exports = app;
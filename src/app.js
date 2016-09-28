'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const Vehicle = require('./models/vehicle');

app.get('/api/vehicles/:id', (req, res) => {
    Vehicle.findOne({ _id: req.params.id })
        .then(v => {
            if (!v) {
                res.status(404).json(null);
            }

            res.json(v)
        })
        .catch(e => res.status(500).json(null));
});

app.get('/api/vehicles', (req, res) => {
    Vehicle.find()
        .then(vehicles => res.json(vehicles))
        .catch(err => res.status(404).json([]));
});

app.post('/api/vehicles', bodyParser.json(), (req, res) => {
    Vehicle.insert(req.body)
        .then(v => res.json(v))
        .catch(e => {
            res.status(400).json({
                success: false,
                errors: e.messages
            });
        });
});

app.put('/api/vehicles/:id', bodyParser.json(), (req, res) => {
    Vehicle.update(req.params.id, req.body)
        .then(v => v ? res.json(v) : res.status(404).json())
        .catch(e => res.status(400).json({
            errors: e.messages
        }));
});

app.delete('/api/vehicles/:id', (req, res) => {
    Vehicle.remove(req.params.id)
        .then(success => res.status(success ? 204 : 404).send())
        .catch(e => res.status(500).json());
});

module.exports = app;
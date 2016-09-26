const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
var request = require('supertest');

const app = require('../src/app');
const vehicleDB = require('../src/database').vehicleDB;

chai.use(chaiHttp);
chai.should();

const testVehicles = [
    { _id: '1', title: 'Test vehicle 1', fuel: 'gasoline', new: false, price: 2900, mileage: 123400, firstregistration: new Date(2010, 3, 16) },
    { _id: '2', title: 'Test vehicle 2', fuel: 'gasoline', new: false, price: 5200, mileage: 113400, firstregistration: new Date(2011, 4, 17) },
    { _id: '3', title: 'Test vehicle 3', fuel: 'diesel', new: false, price: 1500, mileage: 323400, firstregistration: new Date(2012, 5, 18) },
    { _id: '4', title: 'Test vehicle 4', fuel: 'gasoline', new: false, price: 7400, mileage: 412300, firstregistration: new Date(2013, 6, 19) },
    { _id: '5', title: 'Test vehicle 5', fuel: 'gasoline', new: false, price: 6300, mileage: 123490, firstregistration: new Date(2014, 7, 20) },
    { _id: '6', title: 'Test vehicle 6', fuel: 'diesel', new: true, price: 63000 },
    { _id: '7', title: 'Test vehicle 7', fuel: 'gasoline', new: true, price: 39000 },
];

describe('API Tests', () => {
    beforeEach(done => vehicleDB.insert(testVehicles, done));
    afterEach(done => vehicleDB.remove({}, { multi: true }, done));

    describe('GET', () => {
        it('Find one item by _id', () => {
            return chai.request(app).get('/api/vehicles/1').then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body._id).to.equal('1');
            });
        });


        it('Find all items', () => {
            return request(app).get('/api/vehicles').then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.length(testVehicles.length);
            });
        });        

        // it('Search items', () => {
        // });

        it('Item does not exists', done => {
            request(app).get('/api/vehicles/1000').end((err, res) => {
                res.should.have.status(404);
                res.should.be.json;
                res.should.have.property('body', null);
                done();
            });
        });
    });

    describe('POST', () => {
        it('Item gets created', () => {
            const vehicle = {
                title: 'Title',
                fuel: 'gasoline',
                price: 12500,
                new: false,
                mileage: 100000,
                firstregistration: new Date(2013, 5, 12)
            };

            return chai.request(app).post('/api/vehicles').send(vehicle).then(res => {
                res.should.have.status(200);
                res.should.be.json;
                
                res.body._id.should.be.ok;
                res.body.title.should.equal(vehicle.title);
                res.body.fuel.should.equal(vehicle.fuel);
                res.body.price.should.equal(vehicle.price);
                res.body.new.should.equal(vehicle.new);
                res.body.mileage.should.equal(vehicle.mileage);
                new Date(res.body.firstregistration).getTime().should.equal(vehicle.firstregistration.getTime());

                res.body.should.include.key('createdAt');
                res.body.should.include.key('updatedAt');
            });
        });

        it('Some parameters are invalid and request gets rejected', done => {
            const invalidVehicle = {};
            request(app).post('/api/vehicles').send(invalidVehicle).end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.should.deep.equal({
                    success: false,
                    errors: [
                        '"title" is required',
                        '"fuel" is required',
                        '"price" is required',
                        '"new" is required',
                        '"mileage" is required',
                        '"firstregistration" is required'
                    ]
                });
                done();
            });
        });
    });

    describe('PUT', () => {

        it('Item is overwritten if it already exists', done => {
            const id = testVehicles[0]._id;
            const newVehicle = Object.assign({}, testVehicles[0], { title: 'TITLE 2' });

            request(app).put(`/api/vehicles/${id}`).send(newVehicle).end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;

                res.body.should.have.property('title', newVehicle.title);
                done();
            });
        });

        it('Item is created if it does not exist', done => {
            const validVehicle = { title: 'Title', price: 123, fuel: 'gasoline', new: false, mileage: 123400, firstregistration: new Date(2010, 0, 1) };
            request(app).put('/api/vehicles/123').send(validVehicle).end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;

                res.body.should.have.property('title', validVehicle.title);
                res.body.should.have.property('price', validVehicle.price);
                res.body.should.have.property('fuel', validVehicle.fuel);
                res.body.should.have.property('new', validVehicle.new);
                res.body.should.have.property('mileage', validVehicle.mileage);
                res.body.should.have.property('firstregistration', validVehicle.firstregistration.toISOString());
                done();
            });
        });

        it('Invalid data is provided, the request gets rejected', done => {
            const invalidVehicle = {};
            request(app).put('/api/vehicles/123').send(invalidVehicle).end((err, res) => {
                res.should.have.status(400);
                res.should.be.json;
                res.body.should.deep.equal({
                    success: false,
                    errors: [
                        '"title" is required',
                        '"fuel" is required',
                        '"price" is required',
                        '"new" is required',
                        '"mileage" is required',
                        '"firstregistration" is required'
                    ]
                });

                done();
            });
        });
    });

    describe('DELETE', () => {
        it('Item gets deleted if it exists', done => {
            request(app).delete('/api/vehicles/1').send().end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;

                res.body.success.should.be.true;
                done();
            });
        });

        it('If item does not exist then 404 is returned', done => {
            request(app).delete('/api/vehicles/1000').send().end((err, res) => {
                res.should.have.status(404);
                res.should.be.json;

                res.body.success.should.be.false;
                done();
            });
        });
    });
});
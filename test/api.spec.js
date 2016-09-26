const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
var request = require('supertest');

const app = require('../src/app');
const vehicleDB = require('../src/database').vehicleDB;

chai.use(chaiHttp);

const testVehicles = [
    { _id: 1, title: 'Test vehicle 1', new: false, price: 2900, mileage: 123400, firstregistration: new Date(2010, 3, 16) },
    { _id: 2, title: 'Test vehicle 2', new: false, price: 5200, mileage: 113400, firstregistration: new Date(2011, 4, 17) },
    { _id: 3, title: 'Test vehicle 3', new: false, price: 1500, mileage: 323400, firstregistration: new Date(2012, 5, 18) },
    { _id: 4, title: 'Test vehicle 4', new: false, price: 7400, mileage: 412300, firstregistration: new Date(2013, 6, 19) },
    { _id: 5, title: 'Test vehicle 5', new: false, price: 6300, mileage: 123490, firstregistration: new Date(2014, 7, 20) },
    { _id: 6, title: 'Test vehicle 6', new: true, price: 63000 },
    { _id: 7, title: 'Test vehicle 7', new: true, price: 39000 },
];

describe('API Tests', () => {
    beforeEach(() => {
        testVehicles.forEach(v => vehicleDB.insert(v));
    });

    afterEach(() => {
        vehicleDB.remove({}, { multi: true });
    });

    describe('GET', () => {
        it('Find one item by _id', () => {
            return chai.request(app).get('/api/vehicles/1').then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body._id).to.equal(1);
            });
        });


        it('Find all items', () => {
            return chai.request(app).get('/api/vehicles').then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('array');
                expect(res.body).to.have.length(testVehicles.length);
            });
        });        

        it('Search items', () => {

        });

        it('Item does not exists', () => {

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
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                
                expect(res.body.title).to.equal(vehicle.title);
                expect(res.body.fuel).to.equal(vehicle.fuel);
                expect(res.body.price).to.equal(vehicle.price);
                expect(res.body.new).to.equal(vehicle.new);
                expect(res.body.mileage).to.equal(vehicle.mileage);
                expect(new Date(res.body.firstregistration).getTime()).to.equal(vehicle.firstregistration.getTime());

                expect(res.body).to.include.key('createdAt');
                expect(res.body).to.include.key('updatedAt');

            });
        });

        it('Item already exists and...', () => {

        });

        it('Some parameters are invalid and request gets rejected', done => {
            const invalidVehicle = {};
            request(app).post('/api/vehicles').send(invalidVehicle).end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.deep.equal({
                    success: false,
                    errors: [
                        '"title" is required',
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
        it('Happy case', () => {

        });

        it('Item already exists and gets overwritten', () => {

        });

        it('Some parameters are invalid and request gets rejected', () => {

        });
    });

    describe('DELETE', () => {
        it('Item gets deleted if it exists', () => {

        });

        it('Nothing happens if item does not exist', () => {

        });
    });
});
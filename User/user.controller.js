const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize')
const Role = require('_helpers/role');
const mysql = require("mysql2");
const config2 = require("../ConfigDB/DB");

// routes
router.post('/authenticate', authenticate);     // public route
router.get('/', authorize(Role.Admin), getAll); // admin only
router.get('/:id', authorize(), getById);       // all authenticated users
router.get('/all/services',  getAllService);
router.get('/all/masters',  getAllMasters);
router.post('/registration',  registration);
router.get('/employee/service/:id', authorize(), getServicesByEmployee);
router.post('/free/time', authorize(), getFreeTime);
router.put('/add/reservation', authorize(), AddReservation);
router.post('/master/reservation', authorize(), getReservationByEmployee);
router.post('/master/change/status', authorize(), changeStatusEmployee);
router.post('/res', authorize(), getReservation);
module.exports = router;


async function authenticate(req, res, next) {

    try {
        let user = await userService.authenticate(req.body);
        user ? res.json(user) : res.status(400).json({message: 'Username or password is incorrect'})
    } catch (err) {
        next(err);
    }
}

async function changeStatusEmployee(req, res, next) {

    try {
        let user = await userService.changeStatusEmployee(req.body);
        user ? res.json(user) : res.status(400).json({message: 'no reservation'})
    } catch (err) {
        next(err);
    }
}

async function getReservationByEmployee(req, res, next) {

    try {
        let user = await userService.getReservationByEmployee(req.body, req.user.sub);
        user ? res.json(user) : res.status(400).json({message: 'no reservation'})
    } catch (err) {
        next(err);
    }
}
async function getReservation(req, res, next) {

    try {
        let user = await userService.getReservation(req.body);
        user ? res.json(user) : res.status(400).json({message: 'no reservation'})
    } catch (err) {
        next(err);
    }
}
async function AddReservation(req, res, next) {

    console.log(req.user.sub);
    try {
        let user = await userService.AddReservation(req.body, req.user.sub);
        user ? res.json(user) : res.status(400).json({message: 'Error'})
    } catch (err) {
        next(err);
    }
}

async function getFreeTime(req, res, next) {

    console.log(req.body)
    try {
        let freetimes = await userService.getFreeTime(req.body);
        freetimes ? res.json(freetimes) : res.status(400).json({message: 'No time for this date'})
    } catch (err) {
        next(err);
    }
}
async function registration(req, res, next) {

    try {
        let user = await userService.registration(req.body);
        user ? res.json(user) : res.status(400).json({message: 'Reservation Error'})
    } catch (err) {
        next(err);
    }
}
async function getAllService(req, res, next) {

    try {
        let user = await userService.getAllService(req.body);
        user ? res.json(user) : res.status(400).json({message: 'No services'})
    } catch (err) {
        next(err);
    }
}
async function getAllMasters(req, res, next) {

    try {
        let masters = await userService.getAllMasters(req.body);
        masters ? res.json(masters) : res.status(400).json({message: 'No masters'})
    } catch (err) {
        next(err);
    }
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getServicesByEmployee(req, res, next) {
    userService.getServicesByEmployee(req.params.id)
        .then(masters => masters? res.json(masters): res.sendStatus(404))
        .catch(err => next(err));
}

function getById(req, res, next) {
    const currentUser = req.user;
    const id = parseInt(req.params.id);

    // only allow admins to access other user records
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}


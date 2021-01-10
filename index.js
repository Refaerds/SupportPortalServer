const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const signup = require('./controllers/signup');
const signin = require('./controllers/signin');
const updateProfile = require('./controllers/update_profile');
const getTickets = require('./controllers/getTickets');
const submitTicket = require('./controllers/submitTicket');
const getFAQs = require('./controllers/getFAQs');

const db = knex({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password : '123',
        database : 'support-portal'
    }
});

const app = express();

app.use(express.json());
app.use(cors());

app.post('/signin', (req, res) => {signin.handleSignin(req, res, db, bcrypt)})

app.post('/signup', (req, res) => {signup.handleSignup(req, res, db, bcrypt)})

app.put('/updateprofile', (req, res) => {updateProfile.handleUpdate(req, res, db, bcrypt)})

app.get('/gettickets/:id', (req, res) => {getTickets.getTickets(req, res, db)})

app.get('/getfaqs', (req, res) => {getFAQs.getFAQs(req, res, db)})

app.put('/submitticket', (req, res) => {submitTicket.handleTicketSubmit(req, res, db)})

app.listen(3000, () => {console.log("listening on port 3000")});
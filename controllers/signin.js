const CustomError = require("../utils/customError");
const val = require('../utils/validations');

const handleSignin = (req, res, db, bcrypt) => {
    let { email, pwd } = req.body;
    email = email.trim();

    try {
        val.validateMandatoryFields(email, pwd);
    }
    catch(err) {
        return res.status(400).send({
            error: err.code, 
            message: err.message
        })
    }

    db.select('email', 'hash').from('accounts')
    .where({email})
    .then(data => {
        if (!data.length) {
            throw new CustomError('Authentication error', 'You have provided wrong email or password')
        }
        const isValid = bcrypt.compareSync(pwd, data[0].hash);
        if (isValid) {
            return db.select('*').from('users')
            .where({email})
            .then(user => res.json(user[0]))
            .catch(err => res.status(400).send({
                error: "Database error", 
                message: "Unable to retrieve user, please try again or contact site support"
            }))
        }
        else {
            throw new CustomError('Authentication error', 'You have provided wrong email or password')
        }
    })
    .catch(err => {
        if (err instanceof CustomError) {
            res.status(400).send({
                error: err.code, 
                message: err.message
            })
        }
        else {
            res.status(400).send({
                error: "Internal error", 
                message: "Something went wrong, please try again or contact site support"
            })
        }
    })
}

module.exports = {
    handleSignin
}
const CustomError = require("../customError");
const val = require('../validations');

const handleSignup = (req, res, db, bcrypt) => {
    let { email, name, pwd } = req.body;
    email = email.trim();
    name = name.trim();

    val.validateEmailNotDuplicate(email, db)
    .then(result => {
        if (result === true) {
            throw new CustomError('Validation error', 'This email is already registered')
        }
        else {
            try {            
                val.validateName(name);
                val.validateEmail(email);
                val.validatePwd(pwd);
                proceedSignUp();
            }
            catch(err) {
                res.status(400).send({
                    error: err.code, 
                    message: err.message
                })
            }
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
    });

    const proceedSignUp = () => {
    
        const hash = bcrypt.hashSync(pwd);
    
        db.transaction(trx => {
            trx.insert({
                email: email,
                hash: hash
            })
            .into('accounts')
            .then(() => {
                return trx.insert({
                        email: email,
                        name: name,
                        created: new Date()})
                    .into('users')
                    .returning('*')
            })
            .then(user => res.json(user[0]))
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .catch(err => res.status(400).send({
            error: "Internal error", 
            message: "Something went wrong, please try again or contact site support"
        }))
    }
}

module.exports = {
    handleSignup
}
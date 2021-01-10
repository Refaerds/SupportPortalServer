const CustomError = require("../customError");
const val = require('../validations');
    
const handleUpdate = (req, res, db, bcrypt) => {
    let { old_data, new_data } = req.body;
    old_data.email = old_data.email.trim();
    old_data.name = old_data.name.trim();
    new_data.email = new_data.email.trim();
    new_data.name = new_data.name.trim();

    try {
        val.validateMandatoryFields(old_data.email, old_data.name, old_data.pwd);
        val.validateUpdateProfileChanges(old_data, new_data);
        val.validateName(new_data.name);
        val.validateEmail(new_data.email);
        if (new_data.pwd) {
            val.validatePwd(new_data.pwd)
        }
    }
    catch(err) {
        return res.status(400).send({
            error: err.code, 
            message: err.message
        })
    }
    
    let account_update = {email: new_data.email};
    if (new_data.pwd) {
        account_update.hash = bcrypt.hashSync(new_data.pwd)
    }

    db.select('email', 'hash').from('accounts')
    .where({email: old_data.email})
    .then(data => {
        if (!data.length) {
            throw new CustomError('Authentication error', 'You have provided wrong email or password')
        }
        const isValid = bcrypt.compareSync(old_data.pwd, data[0].hash);
        if (isValid) {
            return db.transaction(trx => {
                trx('accounts')
                .where({email: old_data.email})
                .update(account_update)
                .then(() => {
                    return trx('users')
                        .where({email: new_data.email})
                        .update({
                            name: new_data.name
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .catch(err => res.status(400).send({
                error: "Database error",
                message: "Unable to update data, please try again or contact site support"
            })) 
        }
        else {
            throw new CustomError('Authentication error', 'You have provided wrong email or password')
        }
    })
    .then(() => { //workaround for .returning which doesn't work with .where on .update
        return db.select('*').from('users')
            .where({email: new_data.email})
            .then(user => res.json(user[0]))
            .catch(err => res.status(400).send({
                error: "Database error",
                message: "Unable to retrieve updated data, please try again or contact site support"
            }))
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
    handleUpdate
}
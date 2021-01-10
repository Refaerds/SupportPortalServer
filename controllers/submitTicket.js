const val = require('../utils/validations');

const handleTicketSubmit = (req, res, db) => {
    let { name, email, issue, description } = req.body;
    email = email.trim();
    name = name.trim();
    issue = issue.trim();
    description = description.trim(); 

    try {
        val.validateName(name);
        val.validateEmail(email);
        val.validateMandatoryFields(issue, description);
    }
    catch(err) {
        return res.status(400).send({
            error: err.code, 
            message: err.message
        })
    }

    db('tickets')
    .insert({
        name: name,
        email: email,
        issue: issue,
        description: description,
        created: new Date()})
    .returning('*')
    .then(ticket => res.json(ticket[0].id))
    .catch(err => res.status(400).send({
        error: "Database error", 
        message: "Unable to create a ticket, please try again or contact site support"
    }))
}

module.exports = {
    handleTicketSubmit
}
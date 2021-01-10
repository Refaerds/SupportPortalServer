const getTickets = (req, res, db) => {
    const { id } = req.params;

    db.select('email').from('users')
    .where({id})
    .then(email => {
        return db.select('*').from('tickets')
            .where({email: email[0].email})
            .then(tickets => {
                res.json(tickets)
            })
            .catch(err => res.status(400).send({
                error: "Database error", 
                message: "Error retrieving tickets"
            }))
    })
    .catch(err => res.status(400).send({
        error: "Authentication error", 
        message: "Error retrieving tickets"
    }))
}

module.exports = {
    getTickets
}
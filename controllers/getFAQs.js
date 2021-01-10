const getFAQs = (req, res, db) => {

    db.select('*').from('faqs')
    .then(faqs => {
        res.json(faqs)
    })
    .catch(err => res.status(400).send({
        error: "Database error", 
        message: "Error retrieving FAQs, please try again later or contact site support"
    }))
}

module.exports = {
    getFAQs
}
const Joi = require('joi');
const logger = require('../utils/logger');
const dictionaries = require('../models/dictionary/dictionaries');
exports.get = async (req, res, next) => {
    const schema = Joi.object().keys({
        language: Joi.string().valid('fr','en').default('en'),
    });
    let value;
    try{
        value = await Joi.validate(req.query, schema);
    }catch(error){
        logger.log('error', 'An error occurred while getting a dictionary',  {error, value: req.query});
        return res.status(400).json(error);
    }
    return res.status(200).json(dictionaries.getDictionary(value.language));
};


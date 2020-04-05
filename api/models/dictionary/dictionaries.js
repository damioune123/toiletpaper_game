const fr = require('./fr');
const en = require('./en');
const getDictionary= (language = 'en') =>{
  switch (language) {
      case "en":
          return en;
      case "fr":
          return fr;
  }
};
module.exports = {
    getDictionary,
};
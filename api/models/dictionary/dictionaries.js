const fr = require('./fr');
const en = require('./en');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const getDictionary= (language = 'en') =>{
  switch (language) {
      case "en":
          return en;
      case "fr":
          return fr;
  }
};
const buildDictionaries= async () =>{
    const readTxtFileToJsonObject =  async function (file) {
        const fileStream = fs.createReadStream(file);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        const obj={};
        for await (const line of rl) {
            obj[line] = 1;
        }
        return obj;
    };
    const buildDictionnary = async (dictionary, directory)=>{
        const directoryPath = path.join(__dirname, directory);
        const files = fs.readdirSync(directoryPath);
        for (const fileName of files) {
            const filePath = path.join(__dirname, directory, fileName);
            const category = fileName.substring(0, fileName.length - 4);
            dictionary.words[category] = await readTxtFileToJsonObject(filePath);
        }
    };
    console.log('Building EN dictionary');
    await buildDictionnary(en, 'en');
    console.log('Building FR dictionary');
    await buildDictionnary(fr, 'fr');
};
module.exports = {
    getDictionary,
    buildDictionaries,
};
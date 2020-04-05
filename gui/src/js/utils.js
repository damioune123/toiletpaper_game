/**
 * Make the text inside the given element as big as possible
 * See: https://github.com/STRML/textFit
 *
 * @param el The parent element of some text
 */
const doTextFit  = (el) => {
    textFit(
        $(el)[0],
        {
            alignHoriz:true,
            alignVert:false,
            widthOnly:true,
            reProcess:true,
            maxFontSize:300
        }
    );
};
/**
 * Show API Error + console.log it
 */
const handleApiError =  (error, msg = '') => {
    console.log(msg, error);
    let formattedError = '';
    if(error.response && error.response.data && error.response.data.details && error.response.data.details[0] && error.response.data.details[0].message){
        formattedError = error.response.data.details[0].message;
    }
    else{
        formattedError = JSON.stringify(error.response ? error.response.data : error)
    }
    console.log(formattedError);
    alert(error);
};
module.exports = {
    doTextFit,
    handleApiError
};
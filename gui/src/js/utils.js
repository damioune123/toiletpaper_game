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
    handleApiError
};
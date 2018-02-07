'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    
    /* in-package */
    ;

function Sandy() {
}

Sandy.prototype.log = function(request, response) {
    console.log(new Date(), response.statusCode, request.url);
};

module.exports = Sandy;


function createRandomString (length) {
    var str = '';
    for (var i = 0; i < length; i++) {
        str += Math.random().toString(36).substr(2);
        return str.substr( 0, length );
    }
}
console.log(createRandomString(6));



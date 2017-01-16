;(function() {

    var deleteCookie = function(name) {
        // quick and dirty cookie delete.
        // just clear it and set it to expire in the past.
        document.cookie = name + '="";path=/;' +
        'expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    var getBaseURL = function() {
        var port = location.port;
        var portString = '';
        if (port !== '') {
            portString = ':' + port;
        }
        return location.protocol + '//' + location.hostname + portString + '/';
    };

    var doLogout = function() {
        var baseURL = getBaseURL();
        // delete the local CAS session cookie
        deleteCookie('MOD_AUTH_CAS');

        // redirect to CAS logout
        var casLogout = 'https://cas.columbia.edu/cas/logout';
        window.location.href = casLogout + '?service=' + escape(baseURL);
    };

    $(document).ready(function() {
        $('#logout-button').click(doLogout);
    });
}());

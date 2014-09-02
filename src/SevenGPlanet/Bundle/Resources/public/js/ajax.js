// Document ready functions to initalise things
// Note: this file should be included before any other files that might
// use Ajax in their document ready function
$(function() {
    // setup environment for Ajax comms
    $.ajaxSetup({
        beforeSend: function(xhr) {
            // set wait cursor before sending requests
            document.body.style.cursor = 'wait';
            $("body").addClass("wait");
            return true;
        }
    });

    $.ajaxSetup({
        complete: function() {
            // clear wait cursor when requests complete
            document.body.style.cursor = 'auto';
            $("body").removeClass("wait");
            return false;
        }
    });

    $.ajaxSetup({
        error: function(xhr, status, error) {
            // during development show full stack trace in window on any exception
            var win = window.open();
            win.document.open();
            win.document.write("<div>" + status + " : " + error + "</div>");
            win.document.write("<div>" + xhr.responseText + "</div>");
            win.document.close();
        }
    });
});

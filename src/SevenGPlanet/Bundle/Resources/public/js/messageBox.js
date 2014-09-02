/**
 * Created by RAM on 25/07/14.
 */

//
// Display a modal dialog (message box). A callback function can optionally be provided
// to indicate if the Yes button was used to close. Note that there is no notification if
// the message box is closed by escaping or using the X close button.
//
function messageBox(message, callback) {
    // restore the normal cursor
    document.body.style.cursor = 'auto';

    var messageBox = $("#messageBox");

    // set the dialog text
    $("#messageBox").html(message);

    if (!callback) {
        // display modal dialog
        //noinspection JSUnresolvedFunction
        $("#messageBox").dialog({
            modal: true,
            title: 'MapInsight',
            draggable: true,
            resizable: false,
            position: ['center', 'top'],
            show: 'blind',
            hide: 'blind',
            //width: 400,
            //dialogClass: 'dialog_style1',
            buttons: { 'Ok': function() { $(this).dialog("close"); }}
        });
    }
    else {
        // display modal dialog
        //noinspection JSUnresolvedFunction
        $("#messageBox").dialog({
            modal: true,
            title: 'MapInsight',
            draggable: true,
            resizable: false,
            position: ['center', 'top'],
            show: 'blind',
            hide: 'blind',
            //width: 400,
            //dialogClass: 'dialog_style1',
            buttons: {
                "Yes": function () {
                    $(this).dialog('close');
                    callback(true);
                },
                "No": function () {
                    $(this).dialog('close');
                    callback(false);
                }
            }
        });
    }
}


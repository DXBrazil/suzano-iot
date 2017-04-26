module.exports = function (context, input) {
    context.log('JavaScript manually triggered function called with input:', input);

    var me = {
            name: "Suzano Hackaton",
            email: "sender@ms.com"
        };

    var message = {
        to: "rec@ms.com",
        from: me,
        subject: "Suzano Notificacao",
        content: [{
            type: 'text/html',
            value: input
        }]
    };

    context.done(null, message);
};
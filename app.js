var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send("You said: %s", session.message.text);
});

bot.dialog('help', (session, args, next) => {
    // Send message to the user and end this dialog
    session.endDialog('This is a simple bot that collects a name and age.');
}).triggerAction({
    matches: /^help$/,
    onSelectAction: (session, args, next) => {
        // Add the help dialog to the dialog stack 
        // (override the default behavior of replacing the stack)
        session.beginDialog(args.action, args);
    }
}).cancelAction('cancelList', "List canceled", { 
    matches: /^cancel/i,
    confirmPrompt: "Are you sure?"
});

// Add dialog for creating a list
bot.dialog('listBuilderDialog', function (session) {
    if (!session.dialogData.list) {
        // Start a new list 
        session.dialogData.list = [];
        session.send("Each message will added as a new item to the list.\nSay 'end list' when finished or 'cancel' to discard the list.\n")
    } else if (/end.*list/i.test(session.message.text)) {
        // Return current list
        session.endDialogWithResult({ response: session.dialogData.list });
    } else {
        // Add item to list and save() change to dialogData
        session.dialogData.list.push(session.message.text);
        session.save();
    }
}).cancelAction('cancelList', "List canceled", { 
    matches: /^cancel/i,
    confirmPrompt: "Are you sure?"
});

// Add dialog to handle 'Buy' button click
bot.dialog('buyButtonClick', function (session) {
    if (!session.dialogData.text) {

    } else {

    }
}).triggerAction({ 
        matches: /(buy|add)\s.*shirt/i,
        confirmPrompt: "This will cancel adding the current item. Are you sure?" 
}).cancelAction('cancelBuy', "Ok... Item canceled", { 
        matches: /^cancel/i,
        confirmPrompt: "are you sure?" 
}).reloadAction('reloadBuy', "Restarting order.", { 
        matches: /^start over/i,
        confirmPrompt: "are you sure?" 
});


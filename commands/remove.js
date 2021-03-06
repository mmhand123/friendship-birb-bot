const request = require("request-promise-native");

module.exports = {
  name: "remove",
  description: "Remove a discord user or users from the list",
  execute(client, message, args) {
    if (!message.member.roles.find("name", "Elroy Admin")) {
      return message.reply("Sorry you cannot execute this command.");
    }
    const taggedUsers = message.mentions.users;

    taggedUsers.forEach(async function(user) {
      try {
        const response = await request.delete(
          `${process.env.API}api/users/${user.id}.json`,
          {
            auth: {
              bearer: process.env.elroy
            },
            form: {}
          }
        );
        message.channel.send(`Arf! I removed <@${user.id}> from the list.`);
      } catch (error) {
        message.channel.send(`Arf! I couldn't find <@${user.id}> on the list.`);
      }
    });
  }
};

module.exports = {
  name: "yank",
  description: "Remove a role from a discord user",
  execute(client, message, args) {
    if (!message.member.roles.find("name", "Elroy Admin")) {
      return message.reply("Sorry you cannot execute this command.");
    }
    const taggedUsers = message.mentions.users;

    if (taggedUsers <= 10) {
      const role = message.guild.roles.find("name", "AOTC Winner");

      taggedUsers.forEach(async function(user) {
        const member = await message.guild.fetchMember(user);
        member.removeRole(role, "I am a vengeful dog");
      });

      message.reply("Arf! Done!");
    } else {
      message.reply(
        "I can only remove roles to 10 people at a time. Try to tag fewer people!"
      );
    }
  }
};

const LINKS_TITLE = `Helpful Links`;
const LINKS_BODY = `[Our subreddit](https://www.reddit.com/r/WoWARD/)
[ARD FAQ](https://www.buzzfeed.com/mjs538/the-25-cutest-corgi-puppies-currently-online?utm_term=.fpX77bMnOA#.hnkdd6xZrM)`;

module.exports = {
  name: "links",
  description: "List ARD links",
  async execute(client, message, args) {
    const embed = {
      color: 3447003,
      title: LINKS_TITLE,
      description: LINKS_BODY
    };
    await message.channel.send({ embed });
    await message.channel.send(`https://discord.gg/ebG2wBv`);
  }
};

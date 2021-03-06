const blizz = require("blizzard.js").initialize({ apikey: process.env.BLIZZ });
const request = require("request-promise-native");
const REALM_NOT_FOUND = "Realm not found.";
const CHARACTER_NOT_FOUND = "Character not found.";
const NOT_HORDE = "Not Horde. We are FOR THE HORDE!";
const BIRB_ID = 12110;
const HAS_BIRB = "Has Friendship birb already";
const DUPLICATE = "Character or discord user is already on our list";
const logger = require("winston");

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});
logger.level = "debug";

module.exports = {
  name: "enter",
  description: "Add me to the list motherlover",
  async execute(client, message, args) {
    let fields;
    message.react("🤔");

    if (args.length === 2) {
      const [charName, serverName] = args;
      const errorBuilder = {
        status: "ok",
        errors: {
          character: [],
          server: [],
          birb: []
        }
      };
      await doTheRequest(charName, serverName, errorBuilder);

      if (errorBuilder.status === "ok") {
        const status = await addToBirbList(
          message.author,
          charName,
          serverName
        );
        if (status === 201) {
          message.react("✅");
        } else if (status === 422) {
          errorBuilder.status = "not_ok";
          errorBuilder.errors.character.push(DUPLICATE);
          message.react("❌");
        }
      } else {
        message.react("❌");
      }
      const embed = {
        color: 3447003,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        description: "Friendship Birb Check!!!!!!",
        fields: buildFields(errorBuilder),
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "woof I am dog"
        }
      };
      message.reply({ embed });
    } else {
      message.channel.send(
        `I need you to send me your character name, then server name in dash-case, ie bleeding-hollow not Bleeding Hollow`,
        { reply: message }
      );
    }
  }
};

async function doTheRequest(charName, serverName, errorBuilder) {
  try {
    const char = await blizz.wow.character(["profile", "achievements"], {
      origin: "us",
      realm: serverName,
      name: charName
    });
    const hasBirb = char.data.achievements.achievementsCompleted.includes(
      BIRB_ID
    );
    if (char.data.faction === 0) {
      errorBuilder.status = "not_ok";
      errorBuilder.errors.character.push(NOT_HORDE);
      return ["not_ok", NOT_HORDE];
    } else if (hasBirb === true) {
      errorBuilder.status = "not_ok";
      errorBuilder.errors.birb.push(HAS_BIRB);
      return ["not_ok", HAS_BIRB];
    }
    return ["ok"];
  } catch (error) {
    errorBuilder.status = "not_ok";
    const reason = error.response.data.reason;

    if (reason === REALM_NOT_FOUND) {
      errorBuilder.errors.server.push(REALM_NOT_FOUND);
    } else if (reason === CHARACTER_NOT_FOUND) {
      errorBuilder.errors.character.push(CHARACTER_NOT_FOUND);
    }
    return ["not_ok", reason];
  }
}

async function addToBirbList(author, charName, serverName) {
  try {
    const response = await request.post(`${process.env.API}api/users.json`, {
      auth: {
        bearer: process.env.elroy
      },
      form: {
        user: {
          discord_name: author.tag,
          discord_id: author.id,
          wow_name: charName,
          wow_server: serverName,
          status: "active",
          status_date: new Date()
        }
      }
    });
    return 201;
  } catch (error) {
    logger.debug(error);
    return 422;
  }
}

function buildFields(errorBuilder) {
  let fields = [];
  const charErrors = errorBuilder.errors.character;
  const serverErrors = errorBuilder.errors.server;
  const birbErrors = errorBuilder.errors.birb;

  if (charErrors.length > 0) {
    let str = "";
    charErrors.forEach(error => (str += `${error}\n`));
    fields.push({ name: "❌ Character", value: str });
  } else {
    fields.push({
      name: "✅ Character",
      value: "I found your character\nIt is HORDE\nIt is not a duplicate"
    });
  }

  if (serverErrors.length > 0) {
    let str = "";
    serverErrors.forEach(error => (str += `${error}\n`));
    fields.push({ name: "❌ Server", value: str });
  } else {
    fields.push({
      name: "✅ Server",
      value: "I found your server"
    });
  }

  if (birbErrors.length > 0) {
    let str = "";
    birbErrors.forEach(error => (str += `${error}\n`));
    fields.push({ name: "❌ Birb status", value: str });
  } else {
    fields.push({
      name: "✅ Birb status",
      value: "You do not currently have the friendship birb"
    });
  }

  if (errorBuilder.status === "ok") {
    fields.push({
      name: "✅ All set",
      value: "You are good to go buddy! Hang out and wait for the lottery."
    });
  }
  return fields;
}

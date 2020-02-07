const Discord = require('discord.js');
const mineflayer = require('mineflayer');
const fs = require("fs");
const config = require('config-yml');
let bot = null;
joinServer();
var commandInterval = null;
const prefix = (`${config.Settings.Bot.prefix}`);
const thumbnail = (`${config.Settings.Bot.thumbnail}`);
const server = (`${config.Settings.Minecraft.host}`);
var baltopEmbed;
var baltopTimer = null;
var baltopBuffer;
const client = new Discord.Client({disableEveryone: true});
//IngameBotstuff
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
async function joinServer() {  // Create + make account join
	bot = mineflayer.createBot({
		viewDistance: 'tiny',
		host: config.Settings.Minecraft.host,
		port: config.Settings.Minecraft.port,
		username: config.Settings.Minecraft.account.email,
		password: config.Settings.Minecraft.account.password,
		version: config.Settings.Minecraft.version ,
		verbose: true });
	repeatingEvent();
    bot.chatAddPattern(/(?:^|[^\w\n])([0-9,]+) has been received from .*? ~(\w+)/, "deposit");
	bot.chatAddPattern(/(?:^|[^\w\n])([0-9,]+) has been sent to .*? ~(\w+)/, "payment");
    bot.chatAddPattern(/(?:^|[^\w\n])([0-9,]+) has been received from .*? (\w+)/, "deposit");
    bot.chatAddPattern(/(?:^|[^\w\n])([0-9,]+) has been sent to .*? (\w+)/, "payment");
	bot.chatAddPattern(/Balance: \$([0-9,]+)/, "balance");
    bot.chatAddPattern(/<!> (\w+) is securing the Outpost! (?:^|[^\w\n])([0-9,]+)/, "outpostsecure");
	bot.chatAddPattern(/<!> (\w+) is capturing the Outpost! (?:^|[^\w\n])([0-9,]+)/, "outpostsecure2");
    bot.chatAddPattern(/<!> (\w+) is losing control of the Outpost! (?:^|[^\w\n])([0-9,]+)/, "outpostlosing");
    bot.chatAddPattern(/^(\d+). .*?(\w+), [\s\S]([0-9,]+)/, "baltop");
	bot.chatAddPattern(/\[(\w+)] \[.*?(\w+) -> me] tp/, "tpAlt1");
	bot.chatAddPattern(/\[(\w+)] \[.*?(\w+) -> me] (.*)$/, "BotPm");
}
//Mineflayer bot
bot.on("end", async => {
	console.log("INFO:> Bot has disconnected from: " + config.Settings.Minecraft.host);
	const botlogschannel = client.channels.find(x => x.name === config.Settings.Channels.BotLogs);
    botlogschannel.send("Disconnected from the server! (if not relogging type `-relog`)");
	relogSequence();
});
bot.on('login', async => {
	console.log("login " + config.Settings.Minecraft.account.username);
	bot.chat("/" + config.Settings.Bot.currentserver);
});
//Events//Actions
bot.on("login", function () {

    let MINUTES = 60000; // 60 Seconds
    let SECONDS = 1000; // 1 Second

    setTimeout(() => {

        setInterval(() => bot.chat("/baltop"), 30 * MINUTES)

    }, 30 * SECONDS)
});
bot.on("BotPm", (server, name, message) => {
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Bot Messages","[" + server + "] " + "[" + name + " -> me] " + message);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.BotPms);
	channel.send({embed: embed});
});
bot.on("deposit", (money, name) => {
    bot.chat(`/p ${name} has just deposited $${money}`);
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Deposit",name + " has just deposited $"+ money);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.DepositLogs);
	channel.send({embed: embed});
});
bot.on("payment", (money, name) => {
	bot.chat(`/p ${name} has just been sent $${money}`);
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Payment",name + " has just been sent $"+ money);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.DepositLogs);
	channel.send({embed: embed});
});
bot.on("balance", (money) => {
	bot.chat(`/p I currently have $${money}`);
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Balance","I currently have $"+ money);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.DepositLogs);
	channel.send({embed: embed});
});
bot.on("outpostsecure", (name, number) => {
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Outpost",`${name} is securing outpost [${number}%]`);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.OutpostSecure);
	channel.send({embed: embed});
});
bot.on("outpostsecure2", (name, number) => {
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Outpost",`${name} is capturing outpost [${number}%]`);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.OutpostSecure);
	channel.send({embed: embed});
});
bot.on("outpostlosing", (name, number) => {
	let embed;
	embed = new Discord.RichEmbed()
		.setColor(1146986)
		.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
		.setThumbnail(thumbnail)
		.addField("Outpost",`${name} is losing outpost [${number}%]`);
	const channel = client.channels.find(x => x.name === config.Settings.Channels.OutpostLosing);
	channel.send({embed: embed});
});
bot.on("tpAlt1",(server, name) =>{
	let whitelist = require("./whitelist.json");
	let username = whitelist.Usernames;
	console.log(whitelist.Usernames);
	for (let i = 0; i < name.length; i++) {
		if (name === username[i]) {
			bot.chat(`/tpa ${username[i]}`);
			const botlogschannel = client.channels.find(x => x.name === config.Settings.Channels.BotLogs);
			botlogschannel.send(config.Settings.Minecraft.account.username + " Has Tped on " + `${server} and preformed ` + `/tpa ${username[i]}`);
		}
	}
});
bot.on("baltop", (rank, name, worth) => {
    baltopBuffer.push({ name: `${rank}. ${name}`, money: `$${worth}` });
    clearTimeout(baltopTimer);
    baltopTimer = setTimeout(sendBaltopEmbed, 1000);
});
function getBaltopEmbed() {
    baltopEmbed = new Discord.RichEmbed().setColor(1146986).setTitle("Baltop").setThumbnail(thumbnail);
    baltopBuffer = []
}
function sendBaltopEmbed() {

    baltopEmbed.setFooter(`${server} | ${new Date().toLocaleDateString()}`)
        .addField("Name", `${baltopBuffer.map(entry => entry.name).join("\n")}`, true)
        .addField("Money", `${baltopBuffer.map(entry => entry.money).join("\n")}`, true);
    const baltopchannel = client.channels.find(x => x.name === config.Settings.Channels.Baltop);
    baltopchannel.send(baltopEmbed);

    getBaltopEmbed();
    baltopTimer = null
}
//Discord Bot//Command Registry
client.on("ready", () => {
	console.log(`${client.user.username} is online!`);
	client.user.setActivity(`${config.Settings.Bot.activity}`, { type: `${config.Settings.Bot.type}` });
    getBaltopEmbed()
  });

client.on("guildMemberAdd", member => {
	const welcome = client.channels.find(x => x.name === config.Settings.Channels.Welcome);
	const role = member.guild.roles.find(x => x.name === config.Settings.Bot.FirstJoinRole);
	member.addRole(role).then(r => welcome.send("Welcome " + member));
});
client.on("guildMemberRemove", member => {
	const welcome = client.channels.find(x => x.name === config.Settings.Channels.Welcome);
	welcome.send("GoodBye " + member);
});
client.on('message' , async (message) => {
	if(message.author.username === client.user.username) { return; }
	if (!message.content.startsWith(prefix)) return;
	if (!message.member.roles.some(r => ["*", "Dev", config.Settings.Bot.IslandRole].includes(r.name))) {
		return message.reply("You can't use this command.")
	}
	const args = message.content.slice(config.Settings.Bot.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	if(!message.content.startsWith(`${config.Settings.Bot.prefix}`)) { return; }
		switch (command) {
			case 'relog':
				console.log("INFO:> Force relog called!");
				try {
					bot.end();
				} catch { console.log("INFO:> Bot wasn't even online!"); }
				break;
			case 'bal':
				try {
					balCommand(); // Complete
				} catch (err) {
					console.log(err.message);
				}
				break;
			case 'chat':
				try {
					chatCommand(message, args); // Complete
				} catch (err) {
					console.log(err.message);
				}
				break;
			case 'pay':
				try {
					payCommand(message, args); // Complete
				} catch (err) {
					console.log(err.message);
				}
				break;
            case 'baltop':
                try {
                    baltopCommand(); // Complete
                } catch (err) {
                    console.log(err.message);
                }
                break;
			case 'whitelistadd':
				try {
					whitelistCommand(message, args); // Complete
				} catch (err) {
					console.log(err.message);
				}
				break;
		}
});
async function repeatingEvent() {
	commandInterval = setInterval(function() {
		try {
			bot.chat("/" + config.Settings.Bot.currentserver);
		} catch { console.log("ERROR:> Could not execute bot.chat in commandInterval!"); }
	}, 60000);
}
async function relogSequence() {
	bot = null;
	clearInterval(commandInterval);
	commandInterval = null;

	sleep(20000)
	.then(() => {
		console.log("INFO:> Starting relog");
		const botlogschannel = client.channels.find(x => x.name === config.Settings.Channels.BotLogs);
		botlogschannel.send("Attempting to relog " + config.Settings.Minecraft.account.username + config.Settings.Minecraft.host);
		joinAccount();
	})
	.then(() => {
		sleep(5000)
			.then(() => {
				bot.chat("/" + config.Settings.Bot.currentserver);
			})
	});
}
async function balCommand(){
	bot.chat("/bal");
}
async function baltopCommand(){
    bot.chat("/baltop");
}
client.on("message", message => {
	if(message.content.startsWith(`${prefix}help`)) {
		let Commands = "";
		Commands += '**Commands that Island members can use.**\n';
		Commands += '\n';
		Commands += `**${prefix}relog**: Relogs the alt if disconnects\n`;
		Commands += `**${prefix}Baltop**: Shows the current Baltop.\n`;
		Commands += `**${prefix}Bal**: Shows the current bal of bot.\n`;
		Commands += `**${prefix}pay <IGN> <AMOUNT>**: Sends money to a player.\n`;
		Commands += `**${prefix}chat <Message>**: Sends message in chat\n`;
		Commands += `**${prefix}help**: Shows the commands that can be used.\n`;
		Commands += `**${prefix}whitelistadd <IGN>**: Shows the commands that can be used.\n`;
		Commands += '\n';

		let embed;
		embed = new Discord.RichEmbed()
			.setColor(1146986)
			.setFooter(server + ` | ${new Date().toLocaleDateString()}`)
			.setThumbnail(thumbnail)
			.addField("\nCommands\n", Commands, true);
		message.channel.send({embed: embed});

	}
});
async function chatCommand(message, args){
		if(args.length === 0) { message.reply("What do you want me to execute?")}
		else {
			bot.chat(await commandString(args));
		}
}
async function payCommand(message, args){
	if(args.length === 0) { message.reply("Please Use -pay {UserName} {Amount}")}
	else {
		bot.chat("/pay " + await commandString(args));
	}
}
async function whitelistCommand(message, args) {
	if(args.length === 0) { message.reply("What is your ign?")}
	else {
		fs.readFile('whitelist.json', (err, data) => {
			if (err) throw err;
			let usernames = JSON.parse(data);
			//console.log(usernames);
			usernames.Usernames.push(args[0]);
			//console.log(usernames);
			let toWrite = JSON.stringify(usernames, null, 2);
			fs.writeFile('whitelist.json', toWrite, (err) => {
				if (err) throw err;
				message.reply(args[0] + " has been added to whitelist")
			});
		});
	}
}
//async function whitelistRemoveCommand(message, args) {
//	if (args.length === 0) {
//		message.reply("What is your ign?")
//	} else {
//		fs.readFile('whitelist.json', (err, data) => {
//			if (err) throw err;
//			let usernames = JSON.parse(data);
//			//console.log(usernames);
//			usernames.Usernames.splice(usernames.Usernames.indexOf(args[0]), 1);
//			//console.log(usernames);
//			let toWrite = JSON.stringify(usernames, null, 2);
//			fs.writeFile('whitelist.json', toWrite, (err) => {
//				if (err) throw err;
////				message.reply(args[0] + " has been removed from whitelist")
//			});
//		});
//	}
//}

async function commandString(args) {
	let commandcomplete = "";
	for (let i = 0; i < args.length; i++) {
		commandcomplete += args[i] + " ";
	}
	return commandcomplete;
}
bot.on('message', (chatMessage) => {
	if (chatMessage.toString().length < 1) {
		return;
	}
	try{
	const serverLogChannel = client.channels.find(x => x.name === config.Settings.Channels.IngameChat);
	serverLogChannel.send("`" + chatMessage.toString() + "`");
	}catch(e){console.log("[ERROR]",e)}
});
client.on('message', message => {
	const serverLogChannel = client.channels.find(x => x.name === config.Settings.Channels.IngameChat);
	if (message.channel !== serverLogChannel) return;
	if (message.author.bot) return;
	bot.chat("" + message);
});
client.login(config.Settings.Bot.token); //Log in bot (Token needed)

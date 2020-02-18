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

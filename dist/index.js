"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const face_1 = require("./face");
const nedb_adapter_1 = require("./adapter/nedb-adapter");
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const commands_1 = require("./commands");
const auth_1 = require("./auth");
const embeds_1 = require("./embeds");
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
http_1.default
    .createServer(function (req, res) {
    res.write('OK');
    res.end();
})
    .listen(8080);
const ptList = new nedb_adapter_1.Nedb();
const client = new discord_js_1.Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
});
client.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    yield ((_a = client.application) === null || _a === void 0 ? void 0 : _a.commands.set(commands_1.commands, (_b = process.env.SERVER_ID) !== null && _b !== void 0 ? _b : ''));
    console.log('Ready!');
}));
client.on('interactionCreate', (interaction) => onInteraction(interaction).catch((err) => console.error(err)));
function onInteraction(interaction) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    return __awaiter(this, void 0, void 0, function* () {
        if (!interaction.isCommand()) {
            return;
        }
        if (interaction.channelId !== process.env.DEAL_CHANNEL_ID) {
            yield interaction.reply((0, embeds_1.dangerEmbeds)('コマンドを実行するchが違うようです。'));
            return;
        }
        const guild = client.guilds.cache.get((_a = process.env.SERVER_ID) !== null && _a !== void 0 ? _a : '');
        if (interaction.commandName === commands_1.commandsValue.dealer) {
            if (!interaction.isChatInputCommand())
                return;
            if (interaction.options.getSubcommand() === commands_1.subCommandsValue.create) {
                const ptname = (_b = interaction.options.getString('ptname')) !== null && _b !== void 0 ? _b : '';
                const isExist = yield ptList.get(ptname);
                if (isExist) {
                    yield interaction.reply((0, embeds_1.dangerEmbeds)('既に存在するptです。'));
                    return;
                }
                yield ptList.create(ptname, interaction.user.id);
                yield interaction.reply((0, embeds_1.successEmbeds)(`:triangular_flag_on_post: ${ptname} 作成完了!`));
            }
            if (interaction.options.getSubcommand() === commands_1.subCommandsValue.list) {
                const list = yield ptList.getAll();
                if (list !== null && list.length !== 0) {
                    const fields = list.map((pt) => {
                        return {
                            name: pt.name,
                            value: `${pt.list.length}名の参加者`,
                            inline: true
                        };
                    });
                    yield interaction.reply((0, embeds_1.successEmbeds)(':family_mmgb: PT一覧', fields));
                }
                else {
                    yield interaction.reply((0, embeds_1.dangerEmbeds)('ptは1件も登録されていません。'));
                }
            }
            if (interaction.options.getSubcommand() === commands_1.subCommandsValue.remove) {
                const ptname = (_c = interaction.options.getString('ptname')) !== null && _c !== void 0 ? _c : '';
                const pt = yield ptList.get(ptname);
                if (pt !== null) {
                    if (!(yield (0, auth_1.isAuth)(interaction, pt))) {
                        const creator = yield ((_e = (yield ((_d = guild === null || guild === void 0 ? void 0 : guild.members) === null || _d === void 0 ? void 0 : _d.fetch(pt.creatorId)))) === null || _e === void 0 ? void 0 : _e.displayName);
                        yield interaction.reply((0, embeds_1.dangerEmbeds)(`pt: ${ptname}を削除する権限がありません。${creator}かロールDiscord AdminまたはOfficerのみ削除できます。`));
                    }
                    yield ptList.delete(ptname);
                    yield interaction.reply((0, embeds_1.successEmbeds)(`:triangular_flag_on_post: ${ptname} 削除完了!`));
                }
                else {
                    yield interaction.reply((0, embeds_1.dangerEmbeds)(`pt: ${ptname}は未登録です。`));
                }
            }
            if (interaction.options.getSubcommand() === commands_1.subCommandsValue.add) {
                const ptname = (_f = interaction.options.getString('ptname')) !== null && _f !== void 0 ? _f : '';
                const pt = yield ptList.get(ptname);
                if (pt !== null) {
                    const userName = (_j = (yield ((_h = (yield ((_g = guild === null || guild === void 0 ? void 0 : guild.members) === null || _g === void 0 ? void 0 : _g.fetch(interaction.user.id)))) === null || _h === void 0 ? void 0 : _h.displayName))) !== null && _j !== void 0 ? _j : '';
                    pt.list.push({
                        userId: interaction.user.id,
                        name: userName,
                        ip: Number(interaction.options.getString('ip')),
                        repairCost: Number(interaction.options.getString('repaircost'))
                    });
                    yield ptList.update(ptname, pt.list);
                    yield interaction.reply((0, embeds_1.successEmbeds)(`:triangular_flag_on_post: ${ptname}に ${userName}::crossed_swords: ${interaction.options.getString('ip')}:tools: ${interaction.options.getString('repaircost')}    追加完了!`));
                }
                else {
                    yield interaction.reply((0, embeds_1.dangerEmbeds)(`pt: ${ptname}は未登録です。`));
                }
            }
            if (interaction.options.getSubcommand() === commands_1.subCommandsValue.member) {
                const ptname = (_k = interaction.options.getString('ptname')) !== null && _k !== void 0 ? _k : '';
                const pt = yield ptList.get(ptname);
                if (pt !== null) {
                    const fields = pt.list.map((pt) => {
                        return {
                            name: `${face_1.face[Math.floor(Math.random() * face_1.face.length)]} ${pt.name}`,
                            value: `:crossed_swords: ${pt.ip.toString()}`,
                            inline: true
                        };
                    });
                    yield interaction.reply((0, embeds_1.successEmbeds)(`:family_mmgb: ${ptname} 参加者一覧!`, fields));
                }
                else {
                    yield interaction.reply((0, embeds_1.dangerEmbeds)(`pt: ${ptname}は未登録です。`));
                }
            }
            if (interaction.options.getSubcommand() === commands_1.subCommandsValue.deal) {
                const ptname = (_l = interaction.options.getString('ptname')) !== null && _l !== void 0 ? _l : '';
                const pt = yield ptList.get(ptname);
                if (pt !== null) {
                    if (!(yield (0, auth_1.isAuth)(interaction, pt))) {
                        const creator = yield ((_o = (yield ((_m = guild === null || guild === void 0 ? void 0 : guild.members) === null || _m === void 0 ? void 0 : _m.fetch(pt.creatorId)))) === null || _o === void 0 ? void 0 : _o.displayName);
                        yield interaction.reply((0, embeds_1.dangerEmbeds)(`pt: ${ptname}を清算する権限がありません。${creator}かロールDiscord AdminまたはOfficerのみ清算できます。`));
                    }
                    const totalIp = pt.list
                        .map((member) => member.ip)
                        .reduce((a, b) => Number(a) + Number(b));
                    const totalCost = pt.list
                        .map((member) => member.repairCost)
                        .reduce((a, b) => Number(a) + Number(b));
                    const silver = Number((_p = interaction.options.getString('silver')) !== null && _p !== void 0 ? _p : '0');
                    const substanceSilver = (silver - totalCost) * 0.8;
                    const fields = pt.list.map((member) => {
                        return {
                            name: `${face_1.face[Math.floor(Math.random() * face_1.face.length)]} ${member.name}: ${member.ip}`,
                            value: `${((substanceSilver * (Number(member.ip) / totalIp) +
                                member.repairCost) /
                                1000000).toFixed(2)}M`,
                            inline: true
                        };
                    });
                    yield interaction.reply((0, embeds_1.successEmbedsWithDescription)(`:confetti_ball: ${pt.name} 清算！`, fields, `:moneybag:合計: ${(silver / 1000000).toFixed(2)}M 修理費: ${(totalCost / 1000000).toFixed(2)}M 分配金: × 0.8 = ${(substanceSilver / 1000000).toFixed(2)}M \n:crossed_swords:平均IP: ${Math.floor(totalIp / pt.list.length)} \n:family_mmgb:参加人数: ${pt.list.length}名`));
                    yield ptList.delete(ptname);
                }
                else {
                    yield interaction.reply((0, embeds_1.dangerEmbeds)(`pt: ${ptname}は未登録です。`));
                }
            }
        }
    });
}
client.login(process.env.TOKEN);

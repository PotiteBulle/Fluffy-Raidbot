import { Guild, GuildMember, TextChannel } from 'discord.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

// Paramètres
const NEW_MEMBERS_LIMIT = 5; // Si 5 personnes arrivent d'un coup > 'Suspected Raid'
const RAID_RESET_TIME = 300000; // 5 minutes (intervales)
const RAID_MODE_DURATION = 1800000; // 30 minutes (temps du mode sécurité)

let newMembersCount = 0;
let raidDetected = false;
let resetTimeout: ReturnType<typeof setTimeout> | null = null;

// Gestion des nouveaux membres
export function handleNewMember(member: GuildMember) {
    if (raidDetected) return;

    newMembersCount++;
    console.log(`Nouveau membre : ${member.user.tag}`);

    if (newMembersCount >= NEW_MEMBERS_LIMIT) {
        raidDetected = true;
        activateRaidMode(member.guild);
    }

    // Réinitialisation du compteur avec contrôle d'existence de resetTimeout
    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
        newMembersCount = 0;
        resetTimeout = null;
    }, RAID_RESET_TIME);
}

// Activer le mode RAID
async function activateRaidMode(guild: Guild) {
    console.log('RAID détecté ! Activation du mode sécurité.');
    await logRaidEvent(`RAID détecté sur le serveur : ${guild.name}`);

    guild.channels.cache.forEach((channel) => {
        if (channel instanceof TextChannel) {
            channel.permissionOverwrites.edit(guild.id, {
                SendMessages: false,
            });
        }
    });

    setTimeout(() => deactivateRaidMode(guild), RAID_MODE_DURATION);
}

// Désactiver le mode RAID
async function deactivateRaidMode(guild: Guild) {
    console.log('Fin du mode RAID. Réactivation des salons.');
    await logRaidEvent(`Fin du mode RAID sur le serveur : ${guild.name}`);

    guild.channels.cache.forEach((channel) => {
        if (channel instanceof TextChannel) {
            channel.permissionOverwrites.edit(guild.id, {
                SendMessages: true,
            });
        }
    });

    raidDetected = false;
}

// Enregistrer l'événement de raid
async function logRaidEvent(event: string) {
    const logPath = join(process.cwd(), 'logs', 'raid_logs.txt');
    const logMessage = `${new Date().toISOString()} - ${event}\n`;
    await fs.appendFile(logPath, logMessage);
    console.log('Raid enregistré dans le log.');
}

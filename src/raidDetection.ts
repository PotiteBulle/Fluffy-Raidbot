import { Guild, GuildMember, TextChannel } from 'discord.js';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

// Paramètres pour définir le nombre limite de nouveaux membres avant de détecter un raid
const NEW_MEMBERS_LIMIT = 5; // Limite de nouveaux membres en 5 minutes
let newMembersCount = 0; // Compteur de nouveaux membres
let raidDetected = false; // Booléen indiquant si un raid a été détecté

// Fonction principale pour gérer les nouveaux membres
export function handleNewMember(member: GuildMember) {
    if (raidDetected) return; // Si un raid est déjà détecté, on ignore les nouveaux membres

    newMembersCount++; // Incrémentation du compteur
    console.log(`Nouveau membre : ${member.user.tag}`); // Affiche dans la console le nom du nouveau membre

    // Si le nombre de nouveaux membres dépasse la limite, on détecte un raid
    if (newMembersCount >= NEW_MEMBERS_LIMIT) {
        raidDetected = true; // On active l'état de raid détecté
        activateRaidMode(member.guild); // On active le mode de protection contre les raids
    }

    // Réinitialise le compteur après 5 minutes
    setTimeout(() => {
        newMembersCount = 0; // Réinitialise le compteur
    }, 300000); // 300000 ms = 5 minutes
}

// Fonction pour activer le mode de protection contre les raids
async function activateRaidMode(guild: Guild) {
    console.log('RAID détecté ! Activation du mode sécurité.'); // Message dans la console 'début du mode sécurité'
    await logRaidEvent(`RAID détecté sur le serveur : ${guild.name}`); // Enregistre l'événement dans un log

    // Verrouille tous les salons texte publics
    guild.channels.cache.forEach((channel) => {
        if (channel instanceof TextChannel) { // Vérifie si le canal est un TextChannel
            channel.permissionOverwrites.edit(guild.id, {
                SendMessages: false, // Bloque l'envoi de messages
            });
        }
    });

    // Réactive les salons après 30 minutes
    setTimeout(() => {
        deactivateRaidMode(guild); // Désactive le mode RAID après 30 minutes
    }, 1800000); // 1800000 ms = 30 minutes
}

// Fonction pour désactiver le mode RAID
async function deactivateRaidMode(guild: Guild) {
    console.log('Fin du mode RAID. Réactivation des salons.'); // Message dans la console 'Fin du mode sécurité'
    await logRaidEvent(`Fin du mode RAID sur le serveur : ${guild.name}`); // Enregistre l'événement dans le log

    // Réactive les salons texte publics
    guild.channels.cache.forEach((channel) => {
        if (channel instanceof TextChannel) { // Vérifie si le canal est un TextChannel
            channel.permissionOverwrites.edit(guild.id, {
                SendMessages: true, // Autorise de nouveau l'envoi de messages
            });
        }
    });

    raidDetected = false; // Réinitialise l'état du raid
}

// Fonction pour enregistrer un événement de raid dans un fichier log
async function logRaidEvent(event: string) {
    const logPath = join(process.cwd(), 'logs', 'raid_logs.txt'); // Chemin du fichier de log
    const logMessage = `${new Date().toISOString()} - ${event}\n`; // Message à enregistrer
    await fs.appendFile(logPath, logMessage); // Ajoute le message dans le fichier de log
    console.log('Raid enregistré dans le log.'); // Confirmation dans la console
}
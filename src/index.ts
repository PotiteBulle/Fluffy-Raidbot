import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleNewMember } from './raidDetection';

// Chargement des variables d'environnement depuis le fichier '.env'
dotenv.config();

if (!process.env.DISCORD_TOKEN) {
    console.error("Le token Discord est manquant. Veuillez le configurer dans le fichier .env.");
    process.exit(1); // Arrête le programme si le token est manquant
}

// Création du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Pour surveiller les nouveaux membres
    ],
});

// Préparation du Bot et Connexion
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user?.tag}`);
});

// Écoute de l'événement d'ajout de nouveaux membres
client.on('guildMemberAdd', handleNewMember);

// Connexion du bot avec son token depuis le fichier '.env'
async function startBot() {
    try {
        await client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
        console.error('Erreur lors de la connexion à Discord:', error);
        process.exit(1); // Arrête le programme en cas d'erreur
    }
}

startBot();
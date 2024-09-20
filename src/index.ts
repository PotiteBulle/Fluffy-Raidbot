import { Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv';
import { handleNewMember } from './raidDetection';

// Chargement des variables d'environnement depuis le fichier '.env'
dotenv.config();

//Création du client Discord avec les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Pour surveiller les nouveaux membres
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Préparation du Bot & Connexion
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user?.tag}`);// Affiche un message lorsque le bot est prêt
});

// Écoute l'événement lorsqu'un nouveau membre rejoint le serveur
client.on('guildMemberAdd', handleNewMember); // Appelle de la fonction de gestion des nouveaux membres

// Connexion du bot avec son token discord | Chargement du token depuis le fichier '.env'
client.login(process.env.DISCORD_TOKEN); 
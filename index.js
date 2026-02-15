const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Events,
  EmbedBuilder,
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// CONFIG
const TOKEN = process.env.TOKEN;
const PANEL_CHANNEL = '1472602084074586184'; // canal eloboost
const STAFF_CHANNEL = '1472631615934173438'; // canal pedidos

// Guardar pedidos temporales
const userData = {};

// ================= READY =================
client.once(Events.ClientReady, async () => {
  console.log(`Conectado como ${client.user.tag}`);

  // Buscar canal
  const panel = await client.channels.fetch(PANEL_CHANNEL);
  const messages = await panel.messages.fetch({ limit: 10 });

  const exists = messages.some(
    (msg) =>
      msg.author.id === client.user.id &&
      msg.content.includes('Clove Boost')
  );

  // Enviar panel solo si no existe
  if (!exists) {
    // Embed inicial
    const embed = new EmbedBuilder()
      .setTitle('💎 Clove Boost - ¡Tu Elo sin estrés! 💎')
      .setDescription(
        '¿Cómo contrato un servicio de EloBoost?\n\n' +
        'Sube tu rango lo más rápido posible con uno de nuestros servicios. Garantizamos total confidencialidad y seguridad de tu cuenta.\n\n' +
        '• Haz clic en "Contratar" y alcanza tu rango sin estrés.'
      )
      .setColor(0xFFFFFF) // blanco
      .setImage('https://i.postimg.cc/FFGsNW6y/banner.png')

    await panel.send({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('start')
            .setLabel('Contratar')
            .setStyle(ButtonStyle.Success)
        ),
      ],
    });
  }
}); // 👈 Cierra READY

// ================= MENÚ RANGOS =================
function rangoMenu(id) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder('Selecciona un rango')
      .addOptions([
        { label: 'Hierro', value: 'Hierro' },
        { label: 'Bronce', value: 'Bronce' },
        { label: 'Plata', value: 'Plata' },
        { label: 'Oro', value: 'Oro' },
        { label: 'Platino', value: 'Platino' },
        { label: 'Diamante', value: 'Diamante' },
        { label: 'Ascendente', value: 'Ascendente' },
        { label: 'Inmortal', value: 'Inmortal' },
        { label: 'Radiant', value: 'Radiant' },
      ])
  );
}

// ================= INTERACCIONES =================
client.on(Events.InteractionCreate, async (interaction) => {
  const userId = interaction.user.id;

  // INICIAR
  if (interaction.isButton() && interaction.customId === 'start') {
    userData[userId] = {};

    await interaction.reply({
      content: '📊 Selecciona tu **rango actual**:',
      components: [rangoMenu('actual')],
      ephemeral: true,
    });
  }

  // RANGO ACTUAL
  if (interaction.isStringSelectMenu() && interaction.customId === 'actual') {
    userData[userId].actual = interaction.values[0];

    await interaction.update({
      content: '🎯 Selecciona tu **rango deseado**:',
      components: [rangoMenu('deseado')],
    });
  }

  // RANGO DESEADO
  if (interaction.isStringSelectMenu() && interaction.customId === 'deseado') {
    userData[userId].deseado = interaction.values[0];
    const data = userData[userId];

    await interaction.update({
      content:
        `✅ **Resumen del pedido**\n\n` +
        `📊 Actual: **${data.actual}**\n` +
        `🎯 Deseado: **${data.deseado}**\n\n` +
        `¿Confirmas la contratación?`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirmar')
            .setLabel('Confirmar')
            .setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  }

  // CONFIRMAR
  if (interaction.isButton() && interaction.customId === 'confirmar') {
    const data = userData[userId];

    // Mensaje al usuario
    await interaction.reply({
      content:
        `🎉 **Pedido enviado correctamente**\n\n` +
        `📊 ${data.actual} → ${data.deseado}\n` +
        `Un staff te contactará pronto.`,
      ephemeral: true,
    });

    // Enviar al canal staff
    const staff = await client.channels.fetch(STAFF_CHANNEL);

    await staff.send(`
📥 **NUEVO PEDIDO**

👤 Usuario: ${interaction.user}
🆔 ID: ${interaction.user.id}

📊 Actual: ${data.actual}
🎯 Deseado: ${data.deseado}
    `);

    delete userData[userId];
  }
});

// ================= LOGIN =================
client.login(TOKEN);
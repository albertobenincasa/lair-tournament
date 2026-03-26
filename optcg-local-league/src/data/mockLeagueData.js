export const players = [
  { id: "p1", name: "Alberto", favoriteLeader: "Monkey D. Luffy", currentRank: 1, avatarSeed: "alberto" },
  { id: "p2", name: "Giulia", favoriteLeader: "Trafalgar Law", currentRank: 2, avatarSeed: "giulia" },
  { id: "p3", name: "Lorenzo", favoriteLeader: "Roronoa Zoro", currentRank: 3, avatarSeed: "lorenzo" },
  { id: "p4", name: "Martina", favoriteLeader: "Eustass Kid", currentRank: 4, avatarSeed: "martina" },
  { id: "p5", name: "Davide", favoriteLeader: "Charlotte Katakuri", currentRank: 5, avatarSeed: "davide" },
  { id: "p6", name: "Chiara", favoriteLeader: "Portgas D. Ace", currentRank: 6, avatarSeed: "chiara" },
  { id: "p7", name: "Matteo", favoriteLeader: "Yamato", currentRank: 7, avatarSeed: "matteo" },
  { id: "p8", name: "Francesca", favoriteLeader: "Nami", currentRank: 8, avatarSeed: "francesca" },
  { id: "p9", name: "Marco", favoriteLeader: "Rob Lucci", currentRank: 9, avatarSeed: "marco" },
  { id: "p10", name: "Elena", favoriteLeader: "Sakazuki", currentRank: 10, avatarSeed: "elena" },
  { id: "p11", name: "Federico", favoriteLeader: "Enel", currentRank: 11, avatarSeed: "federico" },
  { id: "p12", name: "Sara", favoriteLeader: "Boa Hancock", currentRank: 12, avatarSeed: "sara" },
];

export const rankings = [
  {
    playerId: "p1",
    points: 42,
    rounds: [
      { round: 1, wins: 3, losses: 0 },
      { round: 2, wins: 4, losses: 1 },
      { round: 3, wins: 4, losses: 1 },
      { round: 4, wins: 3, losses: 0 },
    ],
  },
  {
    playerId: "p2",
    points: 37,
    rounds: [
      { round: 1, wins: 3, losses: 1 },
      { round: 2, wins: 3, losses: 1 },
      { round: 3, wins: 3, losses: 1 },
      { round: 4, wins: 3, losses: 1 },
    ],
  },
  {
    playerId: "p3",
    points: 33,
    rounds: [
      { round: 1, wins: 2, losses: 1 },
      { round: 2, wins: 3, losses: 1 },
      { round: 3, wins: 3, losses: 1 },
      { round: 4, wins: 3, losses: 2 },
    ],
  },
  {
    playerId: "p4",
    points: 30,
    rounds: [
      { round: 1, wins: 2, losses: 1 },
      { round: 2, wins: 2, losses: 1 },
      { round: 3, wins: 3, losses: 2 },
      { round: 4, wins: 3, losses: 2 },
    ],
  },
  {
    playerId: "p5",
    points: 28,
    rounds: [
      { round: 1, wins: 2, losses: 1 },
      { round: 2, wins: 2, losses: 1 },
      { round: 3, wins: 2, losses: 2 },
      { round: 4, wins: 3, losses: 3 },
    ],
  },
  {
    playerId: "p6",
    points: 26,
    rounds: [
      { round: 1, wins: 2, losses: 1 },
      { round: 2, wins: 2, losses: 2 },
      { round: 3, wins: 2, losses: 2 },
      { round: 4, wins: 3, losses: 3 },
    ],
  },
  {
    playerId: "p7",
    points: 24,
    rounds: [
      { round: 1, wins: 2, losses: 2 },
      { round: 2, wins: 2, losses: 2 },
      { round: 3, wins: 2, losses: 2 },
      { round: 4, wins: 2, losses: 2 },
    ],
  },
  {
    playerId: "p8",
    points: 22,
    rounds: [
      { round: 1, wins: 2, losses: 2 },
      { round: 2, wins: 2, losses: 3 },
      { round: 3, wins: 2, losses: 2 },
      { round: 4, wins: 1, losses: 2 },
    ],
  },
  {
    playerId: "p9",
    points: 19,
    rounds: [
      { round: 1, wins: 1, losses: 2 },
      { round: 2, wins: 2, losses: 3 },
      { round: 3, wins: 1, losses: 2 },
      { round: 4, wins: 2, losses: 3 },
    ],
  },
  {
    playerId: "p10",
    points: 17,
    rounds: [
      { round: 1, wins: 1, losses: 2 },
      { round: 2, wins: 1, losses: 3 },
      { round: 3, wins: 2, losses: 3 },
      { round: 4, wins: 2, losses: 3 },
    ],
  },
  {
    playerId: "p11",
    points: 14,
    rounds: [
      { round: 1, wins: 1, losses: 3 },
      { round: 2, wins: 1, losses: 3 },
      { round: 3, wins: 1, losses: 3 },
      { round: 4, wins: 1, losses: 3 },
    ],
  },
  {
    playerId: "p12",
    points: 11,
    rounds: [
      { round: 1, wins: 0, losses: 3 },
      { round: 2, wins: 1, losses: 4 },
      { round: 3, wins: 1, losses: 3 },
      { round: 4, wins: 1, losses: 3 },
    ],
  },
];

export const decks = [
  {
    id: "d1",
    leader: "Monkey D. Luffy",
    playerId: "p1",
    winRate: 87,
    type: "Aggro",
    cards: ["Nico Robin", "Sanji", "Jet Pistol", "Rush Zoro", "Radical Beam"],
  },
  {
    id: "d2",
    leader: "Trafalgar Law",
    playerId: "p2",
    winRate: 81,
    type: "Midrange",
    cards: ["Bepo", "Shachi & Penguin", "Gordon", "Otama", "Fire Fist"],
  },
  {
    id: "d3",
    leader: "Roronoa Zoro",
    playerId: "p3",
    winRate: 78,
    type: "Aggro",
    cards: ["Nami", "Brook", "Tony Tony Chopper", "Sunny-kun", "Diable Jambe"],
  },
  {
    id: "d4",
    leader: "Eustass Kid",
    playerId: "p4",
    winRate: 74,
    type: "Control",
    cards: ["Killer", "Wire", "Punk Gibson", "Scratchmen Apoo", "X. Drake"],
  },
  {
    id: "d5",
    leader: "Charlotte Katakuri",
    playerId: "p5",
    winRate: 71,
    type: "Control",
    cards: ["Charlotte Smoothie", "Cracker", "Perospero", "Brulee", "Thunder Bolt"],
  },
  {
    id: "d6",
    leader: "Portgas D. Ace",
    playerId: "p6",
    winRate: 69,
    type: "Midrange",
    cards: ["Marco", "Izo", "Vista", "Seaquake", "Whitebeard Pirates"],
  },
  {
    id: "d7",
    leader: "Yamato",
    playerId: "p7",
    winRate: 66,
    type: "Midrange",
    cards: ["Momonosuke", "Kin'emon", "Hiyori", "You Can Be My Samurai", "Onigashima"],
  },
  {
    id: "d8",
    leader: "Nami",
    playerId: "p8",
    winRate: 63,
    type: "Control",
    cards: ["Kaya", "Nojiko", "Usopp", "Arabesque Brick Fist", "Zeff"],
  },
  {
    id: "d9",
    leader: "Rob Lucci",
    playerId: "p9",
    winRate: 60,
    type: "Aggro",
    cards: ["Kaku", "Blueno", "Hattori", "Six King Pistol", "Air Door"],
  },
  {
    id: "d10",
    leader: "Sakazuki",
    playerId: "p10",
    winRate: 57,
    type: "Control",
    cards: ["Kuzan", "Borsalino", "Tsuru", "Great Eruption", "Meteor Volcano"],
  },
];

export const roundDeckUsage = [
  {
    round: 1,
    entries: [
      { leader: "Monkey D. Luffy", count: 4 },
      { leader: "Trafalgar Law", count: 3 },
      { leader: "Charlotte Katakuri", count: 2 },
      { leader: "Roronoa Zoro", count: 2 },
      { leader: "Sakazuki", count: 1 },
    ],
  },
  {
    round: 2,
    entries: [
      { leader: "Trafalgar Law", count: 4 },
      { leader: "Monkey D. Luffy", count: 3 },
      { leader: "Sakazuki", count: 3 },
      { leader: "Yamato", count: 1 },
      { leader: "Nami", count: 1 },
    ],
  },
  {
    round: 3,
    entries: [
      { leader: "Roronoa Zoro", count: 4 },
      { leader: "Monkey D. Luffy", count: 3 },
      { leader: "Charlotte Katakuri", count: 2 },
      { leader: "Rob Lucci", count: 2 },
      { leader: "Sakazuki", count: 1 },
    ],
  },
  {
    round: 4,
    entries: [
      { leader: "Sakazuki", count: 4 },
      { leader: "Trafalgar Law", count: 3 },
      { leader: "Portgas D. Ace", count: 2 },
      { leader: "Monkey D. Luffy", count: 2 },
      { leader: "Nami", count: 1 },
    ],
  },
];

export const leaderColors = {
  "Monkey D. Luffy": ["red"],
  "Trafalgar Law": ["green", "blue"],
  "Charlotte Katakuri": ["yellow"],
  "Roronoa Zoro": ["red", "green"],
  Sakazuki: ["black", "blue"],
  Yamato: ["green", "yellow"],
  Nami: ["blue"],
  "Rob Lucci": ["black"],
  "Portgas D. Ace": ["red"],
};

export const leagueMeta = {
  leagueName: "Magic Lair League Tournament",
};

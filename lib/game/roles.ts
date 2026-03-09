export type Role =
  | 'godfather'
  | 'agbero'
  | 'dibia'
  | 'soldier'
  | 'whistleblower'
  | 'town_crier'
  | 'nepo_baby'
  | 'citizen'
  | 'recruited_citizen'

export type Team = 'cabal' | 'citizen'

export const ROLE_TEAMS: Record<Role, Team> = {
  godfather: 'cabal',
  agbero: 'cabal',
  recruited_citizen: 'cabal',
  dibia: 'citizen',
  soldier: 'citizen',
  whistleblower: 'citizen',
  town_crier: 'citizen',
  nepo_baby: 'citizen',
  citizen: 'citizen',
}

export const ROLE_LABELS: Record<Role, string> = {
  godfather: 'The Godfather',
  agbero: 'Agbero',
  dibia: 'The Dibia',
  soldier: 'The Soldier',
  whistleblower: 'The Whistleblower',
  town_crier: 'Town Crier',
  nepo_baby: 'Nepo Baby',
  citizen: 'Citizen',
  recruited_citizen: 'Recruited Citizen',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  godfather:
    'You lead the Cabal. Each night, pick a citizen to eliminate. The Dibia can never expose you — you always appear innocent.',
  agbero:
    'You are the muscle of the Cabal. You wake with the Godfather and carry out the night\'s work.',
  dibia:
    'Each night, investigate one player. You will learn if they are Cabal or Citizen — but the Godfather always appears innocent.',
  soldier:
    'Each night, choose one player to protect. If the Cabal targets them, the elimination is blocked.',
  whistleblower:
    'If you are eliminated — day or night — you take one player down with you. Choose wisely.',
  town_crier:
    'Once per game, during the Night Phase, you may call a Point of Order. The next day will have two votes instead of one.',
  nepo_baby:
    'The first time the Cabal tries to eliminate you, you survive and a Cabal member\'s name is leaked to all players.',
  citizen: 'You have no special abilities. Observe. Debate. Vote. Find the Cabal.',
  recruited_citizen:
    'You have been recruited by the Godfather. You now win with the Cabal. Act like a Citizen.',
}

// Role sets by player count — exactly as specified in §6
export const ROLE_SETS: Record<number, Role[]> = {
  4: ['godfather', 'dibia', 'citizen', 'citizen'],
  5: ['godfather', 'dibia', 'soldier', 'citizen', 'citizen'],
  6: ['godfather', 'dibia', 'soldier', 'citizen', 'citizen', 'citizen'],
  7: ['godfather', 'dibia', 'soldier', 'citizen', 'citizen', 'citizen', 'citizen'],
  8: ['godfather', 'agbero', 'dibia', 'soldier', 'whistleblower', 'citizen', 'citizen', 'citizen'],
}

// Roles that have a night action
export const NIGHT_ROLES: Role[] = ['godfather', 'agbero', 'dibia', 'soldier']

export const hasNightAction = (role: Role): boolean => NIGHT_ROLES.includes(role)

// Verbatim narrator copy from §12
export const NARRATOR = {
  nightBanner:
    'The sun has set over Abuja. The streetlights are flickering, and the black SUVs are moving. Welcome to the Night of Long Knives.',
  dayEliminated: (name: string) =>
    `Morning has broken. ${name} was picked up at 2:00 AM. They are currently being processed at Kuje Prison.`,
  dayNobody:
    'An attempt was made on a high-profile target, but the military intercepted the convoy. Nobody is going to Kuje this morning.',
  dayNepoBaby: (agberoName: string) =>
    `The Agberos tried to kidnap a VIP, but Orders from Above came down. The Nepo Baby is safe... but the scandal has leaked a name. ${agberoName} has been spotted on CCTV!`,
  whistleblower: (wb: string, target: string) =>
    `As the Black Maria was driving away, the Whistleblower threw a folder out the window! ${wb} is taking ${target} down with them! Both are going to Kuje!`,
  voteCall:
    'The floor is open for debate. Who is the enemy of the people? Who belongs in Kuje?',
  voteResult: (name: string) => `The people have spoken. ${name}, pack your bags.`,
  pointOfOrder:
    'A Point of Order has been raised! The session is not over. We are holding a Supplementary Election immediately.',
  citizensWin: 'Justice has prevailed. The Cabal has been dismantled. The Capital is safe — for now.',
  cabalWins: 'The settlement is complete. The Cabal controls the Capital. The citizens never stood a chance.',
  chatLocked: 'Night has fallen. The village sleeps.',
}

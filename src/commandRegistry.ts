import { profile } from './config';

export type WorkspaceName = 'help' | 'about' | 'skills' | 'ml' | 'android' | 'data' | 'projects' | 'healthcare' | 'agriculture' | 'iot' | 'experience' | 'certifications' | 'github' | 'linkedin' | 'contact' | 'email' | 'security' | 'process';
export type CommandResult =
  | { type: 'output'; output: string }
  | { type: 'workspace'; output: string; workspace: WorkspaceName }
  | { type: 'clear' }
  | { type: 'home'; output: string }
  | { type: 'unknown'; output: string; suggestions: string[] };
type CommandDefinition = { description: string; aliases?: string[]; run: () => CommandResult };
const launch = (workspace: WorkspaceName, output: string): CommandResult => ({ type: 'workspace', workspace, output });

export const commandRegistry: Record<string, CommandDefinition> = {
  help: { description: 'Open the clickable command directory.', run: () => launch('help', 'Opening the command directory.') },
  about: { description: 'Read Victor’s introduction and working approach.', aliases: ['whoami'], run: () => launch('about', 'Profile loaded: Victor connects applied Machine Learning, Android development, and practical data systems. Full biography and working approach are displayed below.') },
  skills: { description: 'Explore demonstrated skills and areas of interest.', aliases: ['stack'], run: () => launch('skills', 'Skills explorer loaded: focus areas include Machine Learning, Kotlin and Android, Python, SQL, and data engineering. Descriptions and context are displayed below.') },
  ml: { description: 'Launch the applied Machine Learning workspace.', run: () => launch('ml', 'Intelligence Lab loaded: explore AfyaLens with synthetic healthcare records, ShambaSense field observations, and simulated PulseIQ sensor data. No clinical or real-world model outcomes are claimed.') },
  android: { description: 'Launch the Android and mobile product workspace.', run: () => launch('android', 'Mobile Studio loaded: explore interactive sample screens for healthcare, field observations, and expense tracking. These are browser prototypes, not released Android apps.') },
  data: { description: 'Launch the data engineering and management workspace.', aliases: ['etl'], run: () => launch('data', 'Data Systems Workshop loaded: follow a sample record from Sources through Ingestion, Validation, Transformation, Storage, and Analytics.') },
  projects: { description: 'Explore project implementations, prototypes, and directions.', aliases: ['ls'], run: () => launch('projects', 'Project explorer loaded: expand a project below to read its purpose, implementation status, technologies, and available links.') },
  healthcare: { description: 'Explore healthcare data and mobile concepts.', run: () => launch('healthcare', 'Healthcare workspace loaded: AfyaLens uses synthetic laboratory records; AfyaConnect is a mobile organization concept. No diagnosis or real patient data.') },
  agriculture: { description: 'Explore ShambaSense and the field observation concept.', run: () => launch('agriculture', 'Agriculture workspace loaded: filter sample crop observations and add a local synthetic note. The sample is not agricultural advice or live field data.') },
  iot: { description: 'Explore the simulated IoT sensor concept.', run: () => launch('iot', 'PulseIQ loaded: switch between simulated device readings and inspect an unusual sample. No live sensor is connected.') },
  experience: { description: 'See verified community and tutoring activities.', run: () => launch('experience', 'Experience view loaded: includes event-organizing activity (23+ events) and tutoring, with supporting supplied photographs.') },
  certifications: { description: 'Browse certificates and recognition supplied with the portfolio.', aliases: ['certs'], run: () => launch('certifications', 'Certificate gallery loaded: DataCamp, Databricks, Python, SQL, cloud, networking, academic recognition, and student leadership scans are shown below.') },
  github: { description: 'Preview the verified GitHub profile.', run: () => launch('github', `GitHub profile: ${profile.github}`) },
  linkedin: { description: 'Preview the verified LinkedIn profile.', run: () => launch('linkedin', `LinkedIn profile: ${profile.linkedin}`) },
  contact: { description: 'Open email, phone, GitHub, and LinkedIn links.', run: () => launch('contact', 'Opening contact channels.') },
  email: { description: 'Compose a message and open it in your email application.', aliases: ['mail', 'message', 'send'], run: () => launch('email', 'Opening the email composer. Your message will be handed to your email application; nothing is sent by this portfolio.') },
  security: { description: 'Read responsible and security-conscious engineering notes.', run: () => launch('security', 'Opening responsible engineering notes.') },
  process: { description: 'Explore Victor’s practical engineering process.', run: () => launch('process', 'Opening the engineering process.') },
  clear: { description: 'Clear the terminal transcript.', run: () => ({ type: 'clear' }) },
  home: { description: 'Return to the welcome terminal.', aliases: ['pwd', 'cd'], run: () => ({ type: 'home', output: 'Welcome terminal restored.' }) },
  exit: { description: 'Close the current application and return home.', run: () => ({ type: 'home', output: 'Application closed. Welcome back.' }) },
  ai: { description: 'Alias for the Machine Learning workspace.', aliases: ['machine-learning'], run: () => launch('ml', 'Opening the Intelligence Lab.') },
  mobile: { description: 'Alias for Android development.', aliases: ['apps'], run: () => launch('android', 'Opening the Mobile Studio.') },
  pipeline: { description: 'Alias for the data systems workspace.', aliases: ['data-engineering'], run: () => launch('data', 'Opening the Data Systems Workshop.') },
  work: { description: 'Alias for the project explorer.', run: () => launch('projects', 'Opening the project explorer.') },
  events: { description: 'Alias for verified community activities.', run: () => launch('experience', 'Opening activities and experience.') },
  date: { description: 'Show the current date and time in your browser locale.', run: () => ({ type: 'output', output: new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) }) },
  uname: { description: 'Show information about this simulated portfolio environment.', aliases: ['uname-a'], run: () => ({ type: 'output', output: 'Victor Portfolio Workstation · browser-based command simulation · no underlying operating-system shell is exposed.' }) },
  tree: { description: 'Show the portfolio workspace map.', run: () => ({ type: 'output', output: 'portfolio/\n├── about\n├── skills\n├── ml/  healthcare · agriculture · iot\n├── android\n├── data\n├── projects\n├── certifications\n└── contact' }) },
  history: { description: 'Review commands entered during this session.', run: () => ({ type: 'output', output: 'Recent commands are listed in the terminal transcript above.' }) },
  man: { description: 'Open the command directory and usage guide.', aliases: ['manual'], run: () => launch('help', 'Manual opened below. Choose a command to launch a portfolio workspace; all commands are simulated and safe.') },
  which: { description: 'Explain how portfolio commands are resolved.', run: () => ({ type: 'output', output: 'Commands resolve through the portfolio’s predefined command registry. Arbitrary shell commands are not available.' }) },
};

const aliases = new Map<string, string>();
Object.entries(commandRegistry).forEach(([name, definition]) => {
  aliases.set(name, name);
  definition.aliases?.forEach(alias => aliases.set(alias, name));
});
export const availableCommands = [...aliases.keys()];

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[b.length];
}
export function parseCommand(raw: string) {
  const input = raw.trim().toLowerCase();
  if (!input) return { input, command: '', args: [] as string[], canonical: '' };
  const [command, ...args] = input.split(/\s+/);
  return { input, command, args, canonical: aliases.get(command) ?? '' };
}
export function executeCommand(raw: string): CommandResult {
  const parsed = parseCommand(raw);
  const definition = commandRegistry[parsed.canonical];
  if (!definition) {
    let suggestions = availableCommands.filter(name => name.startsWith(parsed.command)).slice(0, 4);
    if (!suggestions.length && parsed.command) suggestions = availableCommands.map(name => ({ name, score: distance(parsed.command, name) })).filter(item => item.score <= 2).sort((a, b) => a.score - b.score).slice(0, 3).map(item => item.name);
    return { type: 'unknown', output: `Command not found: “${parsed.command}”. Type help to browse available views.`, suggestions };
  }
  if (parsed.args.length) return { type: 'unknown', output: `The portfolio CLI accepts one command at a time. Try “${parsed.canonical}” without arguments.`, suggestions: [parsed.canonical] };
  return definition.run();
}

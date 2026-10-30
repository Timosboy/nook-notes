import { hash } from 'bcryptjs';
import { User } from '../users/user.entity';
import {
  DEMO_USER_ID,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_NAME,
} from '../users/demo-user';
import {
  REVIEWER_USER_ID,
  REVIEWER_EMAIL,
  REVIEWER_PASSWORD,
  REVIEWER_NAME,
} from '../users/reviewer-user';
import dataSource from './data-source';
import { Category } from '../categories/category.entity';
import { Note } from '../notes/note.entity';

const WELCOME_CONTENT = [
  'This is a small notes app. A few things to try:',
  '',
  '1. Press N to create a note and / to search',
  '2. Type "- " or "1. " and a list starts by itself',
  '3. Select text and press Cmd+B or Cmd+I',
  '4. Click the icon above the title to pick an emoji',
  '5. Drop or paste an image into a note',
  '',
  '- [ ] Pin this note',
  '- [ ] Create a category from the sidebar',
  '- [ ] Switch to the reading theme',
  '',
  '> Press [ and ] to hide the sidebar and the note list.',
].join('\n');

const CATEGORIES = [
  { name: 'Travel', color: '#337ea9' },
  { name: 'Work', color: '#cb912f' },
  { name: 'Personal', color: '#448361' },
];

type SeedNote = {
  title: string;
  content: string;
  emoji: string;
  categories: string[];
  pinned?: boolean;
  archived?: boolean;
};

const NOTES: SeedNote[] = [
  {
    title: 'Reading list',
    content:
      'The Design of Everyday Things\nA Philosophy of Software Design\nShape Up',
    emoji: '📚',
    categories: ['Personal'],
    archived: true,
  },
  {
    title: 'Ideas for the weekend',
    content:
      'Farmers market on Saturday morning, then a long walk by the river.',
    emoji: '🌿',
    categories: ['Personal'],
  },
  {
    title: 'Sprint retro notes',
    content:
      'What went well: shipped the archive flow early.\nTo improve: smaller PRs, fewer late reviews.\nAction: pair on the categories migration.',
    emoji: '🚀',
    categories: ['Work'],
  },
  {
    title: 'Trip to Cusco',
    content:
      'Book the train to Aguas Calientes two weeks ahead.\nPack layers, the mornings are cold.\nAsk the hostel about luggage storage.',
    emoji: '🏔️',
    categories: ['Travel'],
  },
  {
    title: 'Welcome to Nook',
    content: WELCOME_CONTENT,
    emoji: '👋',
    categories: [],
    pinned: true,
  },
];

const ACCOUNTS = [
  {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    name: DEMO_NAME,
    password: DEMO_PASSWORD,
  },
  {
    id: REVIEWER_USER_ID,
    email: REVIEWER_EMAIL,
    name: REVIEWER_NAME,
    password: REVIEWER_PASSWORD,
  },
];

type Account = (typeof ACCOUNTS)[number];

async function seedAccount(account: Account) {
  const users = dataSource.getRepository(User);
  let user = await users.findOneBy({ email: account.email });
  if (!user) {
    user = await users.save(
      users.create({
        id: account.id,
        email: account.email,
        name: account.name,
        passwordHash: await hash(account.password, 10),
      }),
    );
  }
  const userId = user.id;
  const notes = dataSource.getRepository(Note);

  if ((await notes.countBy({ userId })) > 0) {
    console.log(`Seed skipped: ${account.email} already has notes`);
    return;
  }

  const categories = dataSource.getRepository(Category);
  const savedCategories: Category[] = [];
  for (const category of CATEGORIES) {
    const existing = await categories
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .andWhere('lower(category.name) = lower(:name)', { name: category.name })
      .getOne();
    savedCategories.push(
      existing ??
        (await categories.save(categories.create({ ...category, userId }))),
    );
  }

  for (const { categories, ...note } of NOTES) {
    await notes.save(
      notes.create({
        ...note,
        userId,
        categories: savedCategories.filter(({ name }) =>
          categories.includes(name),
        ),
      }),
    );
  }

  console.log(
    `Seeded ${NOTES.length} notes and ${CATEGORIES.length} categories for ${account.email}`,
  );
}

async function seed() {
  await dataSource.initialize();
  for (const account of ACCOUNTS) await seedAccount(account);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) await dataSource.destroy();
  });

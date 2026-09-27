import { projectRepository } from '../../src/db/repositories/projectRepository';

async function testProjectCreation() {
  console.log('Testing Project Creation...');
  const project = await projectRepository.create({
    id: `proj-test-${Date.now()}`,
    name: 'sale mart system',
    projectType: 'Mobile',
    stack: 'next.js, prisma, postgresssql',
    description: 'mobile and computer sale mart system find demon and supply',
  });

  console.log('Created project:', project);

  const all = await projectRepository.getAll();
  console.log('Total projects in SQLite:', all.length);

  const found = all.find((p) => p.name === 'sale mart system');
  if (!found) {
    throw new Error('Created project not found in database!');
  }

  console.log('PASS: Project "sale mart system" successfully created and verified in SQLite!');
}

testProjectCreation().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});

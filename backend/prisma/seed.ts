import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // Criar empresas
  console.log('👔 Criando empresas...');
  
  const company1 = await prisma.user.create({
    data: {
      name: 'TechNova',
      username: 'technova',
      email: 'contato@technova.com',
      password: await bcrypt.hash('password123', 10),
      type: 'company',
      bio: 'Empresa de tecnologia focada em inovação e AI',
      website: 'https://technova.com',
      industry: 'Tecnologia',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=technova',
    },
  });

  const company2 = await prisma.user.create({
    data: {
      name: 'DevZero Inc',
      username: 'devzero',
      email: 'hr@devzero.io',
      password: await bcrypt.hash('password123', 10),
      type: 'company',
      bio: 'Construindo o futuro da web com Next.js e Node.js',
      website: 'https://devzero.io',
      industry: 'Software',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=devzero',
    },
  });

  // Criar desenvolvedores
  console.log('👨‍💻 Criando desenvolvedores...');

  const dev1 = await prisma.user.create({
    data: {
      name: 'Gabriel Lima',
      username: 'gabriellima',
      email: 'gabriel@example.com',
      password: await bcrypt.hash('password123', 10),
      type: 'developer',
      bio: 'Full Stack Developer apaixonado por React e Node.js',
      role: 'Senior Full Stack Engineer',
      githubUsername: 'gabriellima',
      skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gabriel',
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Juliana Costa',
      username: 'julianacosta',
      email: 'juliana@example.com',
      password: await bcrypt.hash('password123', 10),
      type: 'developer',
      bio: 'Frontend specialist com foco em UX e performance',
      role: 'Frontend Engineer',
      githubUsername: 'julianacosta',
      skills: JSON.stringify(['React', 'Next.js', 'Tailwind', 'Framer Motion', 'TypeScript']),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juliana',
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'Pedro Santos',
      username: 'pedrosantos',
      email: 'pedro@example.com',
      password: await bcrypt.hash('password123', 10),
      type: 'developer',
      bio: 'Backend enthusiast, especialista em APIs e microserviços',
      role: 'Backend Developer',
      githubUsername: 'pedrosantos',
      skills: JSON.stringify(['Node.js', 'Express', 'NestJS', 'MongoDB', 'Redis', 'GraphQL']),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    },
  });

  // Criar vagas
  console.log('💼 Criando vagas...');

  const job1 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Senior Frontend Engineer',
      location: 'Remoto',
      type: 'FullTime',
      salary: 'R$ 18.000',
      description:
        'Buscamos expert em React e animações para criar interfaces de alto impacto. Você será responsável por desenvolver componentes reutilizáveis, otimizar performance e trabalhar próximo ao time de design para criar experiências incríveis.',
      requirements: JSON.stringify(['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS']),
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: company2.id,
      title: 'Fullstack JavaScript Developer',
      location: 'Híbrido (Lisboa)',
      type: 'FullTime',
      salary: '€ 4.500',
      description:
        'Foco em Node.js e Next.js para produtos de escala global. Procuramos alguém que goste de trabalhar tanto no frontend quanto no backend, com conhecimento sólido em APIs RESTful e bancos de dados relacionais.',
      requirements: JSON.stringify(['Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'AWS']),
    },
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: company1.id,
      title: 'Estágio em QA / Automação',
      location: 'Remoto',
      type: 'Internship',
      salary: 'R$ 2.500',
      description:
        'Aprenda automação de testes com Cypress e Playwright. Oportunidade única para iniciar carreira em Quality Assurance com mentoria de profissionais experientes.',
      requirements: JSON.stringify(['JavaScript', 'Lógica de Programação', 'Cypress']),
    },
  });

  // Criar candidaturas com análise de IA simulada
  console.log('📝 Criando candidaturas...');

  await prisma.application.create({
    data: {
      jobId: job1.id,
      developerId: dev2.id,
      aiScore: 92,
      aiReasoning:
        'Excelente match! A candidata possui todas as skills principais requisitadas, incluindo experiência avançada em React, TypeScript e Framer Motion.',
      status: 'REVIEWING',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      developerId: dev1.id,
      aiScore: 88,
      aiReasoning:
        'Ótimo perfil! Possui conhecimento sólido em Node.js, PostgreSQL e Docker. Falta experiência específica em AWS.',
      status: 'PENDING',
    },
  });

  await prisma.application.create({
    data: {
      jobId: job2.id,
      developerId: dev3.id,
      aiScore: 85,
      aiReasoning:
        'Bom match técnico! Forte em Node.js e backend, mas experiência limitada em Next.js no frontend.',
      status: 'PENDING',
    },
  });

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Dados criados:');
  console.log(`   - ${2} empresas`);
  console.log(`   - ${3} desenvolvedores`);
  console.log(`   - ${3} vagas`);
  console.log(`   - ${3} candidaturas`);
  console.log('\n🔑 Credenciais de teste:');
  console.log('   Empresa: contato@technova.com / password123');
  console.log('   Dev: gabriel@example.com / password123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

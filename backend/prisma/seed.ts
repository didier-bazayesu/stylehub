import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: 'Men', slug: 'men' },
  { name: 'Women', slug: 'women' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Shoes', slug: 'shoes' },
];

async function main() {
  console.log('Seeding StyleHub database...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const adminEmail = 'admin@stylehub.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const password_hash = await bcrypt.hash('Admin123!', 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password_hash,
        first_name: 'Super',
        last_name: 'Admin',
        role: Role.SUPER_ADMIN,
        is_verified: true,
      },
    });

    console.log('Created super admin: admin@stylehub.com / Admin123!');
  } else {
    console.log('Super admin already exists, skipping.');
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

/**
 * Script para crear/actualizar el usuario admin directo en PostgreSQL
 * Ejecutar: node setup-admin.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdmin() {
  try {
    console.log('🔧 Configurando usuario admin...\n');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@difiori.com.ec').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Difiori2024!';

    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}\n`);

    // 1. Buscar o crear compañía
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Difiori Floristería',
          slug: 'difiori',
          email: adminEmail,
        },
      });
      console.log('✅ Compañía creada:', company.name);
    } else {
      console.log('✅ Compañía encontrada:', company.name);
    }

    // 2. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    console.log('🔐 Contraseña hasheada\n');

    // 3. Crear o actualizar usuario admin
    const admin = await prisma.users.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        isActive: true,
      },
      create: {
        companyId: company.id,
        email: adminEmail,
        name: 'Admin Difiori',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Usuario admin listo para usar:\n');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}\n`);
    
    console.log('🎉 Puedes iniciar sesión ahora');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();

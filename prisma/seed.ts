import bcrypt from 'bcryptjs';
import prisma from './client';

async function main() {
  console.log('Seeding users...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@expatdakar.com' },
    update: {
      name: 'Super Admin',
      role: 'admin',
      status: 'active'
    },
    create: {
      name: 'Super Admin',
      email: 'admin@expatdakar.com',
      password: adminPassword,
      role: 'admin',
      status: 'active'
    }
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@expatdakar.com' },
    update: {
      name: 'Vendeur Demo',
      role: 'seller',
      status: 'active'
    },
    create: {
      name: 'Vendeur Demo',
      email: 'seller@expatdakar.com',
      password: sellerPassword,
      role: 'seller',
      status: 'active'
    }
  });

  console.log(`Users ready: admin #${admin.id}, seller #${seller.id}`);

  console.log('Seeding categories...');

  const categoryNames = [
    'Immobilier',
    'Électronique',
    'Véhicules',
    'Maison',
    'Mode',
    'Services'
  ];

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  const categoriesByName = new Map(categories.map((category) => [category.name, category]));

  console.log(`Categories ready: ${categories.length}`);

  console.log('Seeding demo ads...');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const demoAds = [
    {
      title: 'Canape 3 places en tres bon etat',
      description: 'Canape confortable, ideal pour salon d appartement. Tres peu utilise, disponible immediatement.',
      price: 180000,
      phone: '+221771112233',
      address: 'Almadies, Dakar',
      images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
      categoryName: 'Maison'
    },
    {
      title: 'iPhone 13 128 Go',
      description: 'Telephone debloque, batterie en bon etat, vendu avec chargeur et coque de protection.',
      price: 320000,
      phone: '+221771112244',
      address: 'Mermoz, Dakar',
      images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=1200&q=80'],
      categoryName: 'Électronique'
    },
    {
      title: 'Studio meuble a louer',
      description: 'Studio propre et securise, proche commerces et plage, ideal pour expatrié ou court sejour.',
      price: 250000,
      phone: '+221771112255',
      address: 'Ngor, Dakar',
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
      categoryName: 'Immobilier'
    },
    {
      title: 'Toyota Yaris 2018',
      description: 'Vehicule bien entretenu, climatisation fonctionnelle, papiers a jour, tres economique.',
      price: 4500000,
      phone: '+221771112266',
      address: 'Point E, Dakar',
      images: ['https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80'],
      categoryName: 'Véhicules'
    },
    {
      title: 'Service de menage a domicile',
      description: 'Prestation serieuse pour appartements et maisons, disponible en semaine et le samedi.',
      price: 15000,
      phone: '+221771112277',
      address: 'Ouakam, Dakar',
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80'],
      categoryName: 'Services'
    }
  ];

  for (const ad of demoAds) {
    const category = categoriesByName.get(ad.categoryName);

    if (!category) {
      throw new Error(`Category not found for ad: ${ad.title}`);
    }

    const existingAd = await prisma.ad.findFirst({
      where: {
        title: ad.title,
        userId: seller.id
      }
    });

    const payload = {
      title: ad.title,
      description: ad.description,
      price: ad.price,
      phone: ad.phone,
      address: ad.address,
      images: JSON.stringify(ad.images),
      status: 'active',
      verificationStatus: 'verified',
      publishedAt: now,
      expiresAt,
      categoryId: category.id,
      userId: seller.id
    };

    if (existingAd) {
      await prisma.ad.update({
        where: { id: existingAd.id },
        data: payload
      });
    } else {
      await prisma.ad.create({
        data: payload
      });
    }
  }

  console.log(`Demo ads ready: ${demoAds.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

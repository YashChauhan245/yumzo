require('dotenv').config();

const prisma = require('../config/prisma');

const demoReels = [
  {
    title: 'Smoky Hakka Noodles',
    caption: 'Wok-tossed noodles with loaded veggies and chili oil finish.',
    videoUrl: 'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
    thumbnailUrl: '/images/reels/reel1.png',
  },
  {
    title: 'Molten Lava Cake',
    caption: 'Warm chocolate center with a scoop of vanilla on top.',
    videoUrl: 'https://videos.pexels.com/video-files/3327722/3327722-uhd_2560_1440_24fps.mp4',
    thumbnailUrl: '/images/reels/reel2.png',
  },
  {
    title: 'Butter Garlic Naan',
    caption: 'Fresh naan straight from tandoor with garlic butter glaze.',
    videoUrl: 'https://videos.pexels.com/video-files/5721039/5721039-uhd_2560_1440_30fps.mp4',
    thumbnailUrl: '/images/reels/reel3.png',
  },
  {
    title: 'Caramel Latte Art',
    caption: 'Silky latte art with caramel drizzle and cocoa dust.',
    videoUrl: 'https://videos.pexels.com/video-files/5946762/5946762-uhd_2560_1440_30fps.mp4',
    thumbnailUrl: '/images/reels/reel4.png',
  },
  {
    title: 'Salmon Dragon Roll',
    caption: 'Fresh salmon roll with creamy avocado and spicy mayo.',
    videoUrl: 'https://videos.pexels.com/video-files/3298572/3298572-uhd_2560_1440_25fps.mp4',
    thumbnailUrl: '/images/reels/reel5.png',
  },
  {
    title: 'Loaded Cheese Nachos',
    caption: 'Crispy chips, melted cheese, jalapeno, and salsa.',
    videoUrl: 'https://videos.pexels.com/video-files/5587442/5587442-uhd_2560_1440_24fps.mp4',
    thumbnailUrl: '/images/reels/reel6.png',
  },
];

async function ensureUser({ email, name, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  // Simple seed password only for demo records, not for real logins.
  return prisma.user.create({
    data: {
      name,
      email,
      password: 'seeded_demo_password_do_not_use',
      role,
      isActive: true,
    },
  });
}

async function run() {
  try {
    const creator = await ensureUser({
      email: 'reels-creator@yumzo.local',
      name: 'Yumzo Creator',
      role: 'customer',
    });

    const viewer = await ensureUser({
      email: 'reels-viewer@yumzo.local',
      name: 'Yumzo Viewer',
      role: 'customer',
    });

    // Recreate only this creator's seeded reels to keep script repeatable.
    await prisma.reelComment.deleteMany({ where: { reel: { userId: creator.id } } });
    await prisma.reelLike.deleteMany({ where: { reel: { userId: creator.id } } });
    await prisma.reel.deleteMany({ where: { userId: creator.id } });

    const createdReels = [];
    for (const reel of demoReels) {
      const created = await prisma.reel.create({
        data: {
          userId: creator.id,
          title: reel.title,
          caption: reel.caption,
          videoUrl: reel.videoUrl,
          thumbnailUrl: reel.thumbnailUrl,
        },
      });

      createdReels.push(created);
    }

    // Add a few likes/comments so feed looks real on first load.
    for (let i = 0; i < createdReels.length; i += 1) {
      const reel = createdReels[i];

      await prisma.reelLike.create({
        data: {
          reelId: reel.id,
          userId: viewer.id,
        },
      });

      if (i % 2 === 0) {
        await prisma.reelComment.create({
          data: {
            reelId: reel.id,
            userId: viewer.id,
            comment: 'Looks amazing. Adding this to my next order!',
          },
        });
      }
    }

    console.log('✅ Reels demo data seeded successfully');
    console.log(`   Reels created: ${createdReels.length}`);
    console.log('   Demo users: reels-creator@yumzo.local, reels-viewer@yumzo.local');
  } catch (error) {
    console.error('❌ Failed to seed reels data:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();

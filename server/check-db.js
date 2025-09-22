import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("🔍 Checking database contents...\n");

    // Check users
    const users = await prisma.user.findMany();
    console.log(`👥 Users (${users.length}):`);
    users.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    // Check mindmaps
    const mindmaps = await prisma.mindmap.findMany({
      include: {
        nodes: true,
        connections: true,
        user: { select: { name: true, email: true } },
      },
    });

    console.log(`\n🧠 Mindmaps (${mindmaps.length}):`);
    mindmaps.forEach((mindmap) => {
      console.log(`  - "${mindmap.title}" - ID: ${mindmap.id}`);
      console.log(`    Owner: ${mindmap.user.name} (${mindmap.user.email})`);
      console.log(
        `    Nodes: ${mindmap.nodes.length}, Connections: ${mindmap.connections.length}`
      );
      console.log(`    Created: ${mindmap.createdAt}`);
    });

    if (mindmaps.length === 0) {
      console.log(
        "\n⚠️  No mindmaps found in database. This explains the 404 error!"
      );
      console.log("💡 Try creating a mindmap through the UI first.");
    }
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

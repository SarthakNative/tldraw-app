import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


async function main() {
const alice = await prisma.user.upsert({
where: { normalizedUsername: "alice" },
update: {},
create: { username: "Alice", normalizedUsername: "alice" },
});


const bob = await prisma.user.upsert({
where: { normalizedUsername: "bob" },
update: {},
create: { username: "Bob", normalizedUsername: "bob" },
});


const project = await prisma.project.upsert({
where: { id: "project-demo" },
update: {},
create: {
id: "project-demo",
name: "Demo Project",
description: "A seeded demo project",
ownerId: alice.id,
whiteboards: {
create: [
{
name: "Welcome Board",
data: { document: { pages: {} }, session: {} },
},
],
},
},
});


await prisma.projectMember.createMany({
data: [
{ projectId: project.id, userId: alice.id },
{ projectId: project.id, userId: bob.id },
],
skipDuplicates: true,
});


console.log({ alice: alice.username, bob: bob.username, project: project.name });
}


main()
.catch((e) => {
console.error(e);
process.exit(1);
})
.finally(async () => {
await prisma.$disconnect();
});
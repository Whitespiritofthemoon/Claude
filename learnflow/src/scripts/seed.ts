import { seedBadges } from '../lib/gamification'

async function main() {
  console.log('Seeding badges...')
  await seedBadges()
  console.log('Done!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

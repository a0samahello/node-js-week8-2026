/**
 * 任務 4：Seeder，種一些資料，證明你建立的資料表真的能使用。
 * 規則：可重複執行（先清空、再種入資料），即使執行多次也不會有資料疊加的狀況。
 * 執行順序：一定要先 npm run migration:run（沒有資料表，就無法種資料）
 */
const { dataSource } = require('./data-source')

/** 清空：被 FK 指著的表最後刪（先刪 COURSE，再 USER / SKILL）。
 *  不用 clear()（TRUNCATE 會被 FK 擋）、不用 delete({})（TypeORM 拒絕空條件）。 */
async function clearAll() {
  for (const name of ['Course', 'User', 'Skill']) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute()
    }
  }
}

async function main() {
  await dataSource.initialize()
  await clearAll()

  // ======================================================================
  // TODO：依照任務內容的規格寫入資料
  //   1. SKILL 三筆：重訓、瑜珈、飛輪
  //   2. USER 兩位教練，role 都為 'COACH'：
  //      海格教練（coach1@livefit.tw）、小美教練（coach2@livefit.tw）
  //   3. COURSE 四堂課：肌力入門班、週末飛輪、晨間瑜珈、核心特訓
  //      每堂課記得接上教練跟技能
  //      關聯的接法：user / skill 直接放前面存好的教練、技能物件
  //     （TypeORM 會自動取出它的 id 填進外鍵），寫法範例：
  //      courseRepo.save({ name: '...', user: 教練物件, skill: 技能物件 })
  // ======================================================================

  // 取得 Repository
  const skillRepo = dataSource.getRepository('Skill')
  // 1. SKILL 三筆：重訓、瑜珈、飛輪
  const skills = await skillRepo.save([
    { name: '重訓' },
    { name: '瑜珈' },
    { name: '飛輪' },
  ])
  // AI 教我用 Map，避免陣列改動引發的連鎖災難
  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]))


  // 取得 Repository
  const userRepo = dataSource.getRepository('User')
  // 2. USER 兩位教練，role 都為 'COACH'
  const users = await userRepo.save([
    { name: '海格教練', email: 'coach1@livefit.tw', role: 'COACH' },
    { name: '小美教練', email: 'coach2@livefit.tw', role: 'COACH' },
  ])
  const userMap = Object.fromEntries(users.map((u) => [u.name, u]))


  // 取得 Repository
  const courseRepo = dataSource.getRepository('Course')  
  // 3. COURSE 四堂課：肌力入門班、週末飛輪、晨間瑜珈、核心特訓
  await courseRepo.save([
    {
      name: '肌力入門班',
      description: '肌力訓練入門班',
      //網路說加 new Date 比較好，會自動轉換時區，否則直接寫字串可能會被當成 UTC 時間
      start_at: new Date('2026-09-01 09:00:00'),
      end_at: new Date('2026-09-01 10:00:00'),
      max_participants: 10,
      user: userMap['海格教練'],
      skill: skillMap['重訓'],
    },
    {
      name: '週末飛輪',
      description: '週末有氧飛輪體驗',
      start_at: new Date('2026-09-05 14:00:00'),
      end_at: new Date('2026-09-05 15:00:00'),
      max_participants: 15,
      user: userMap['海格教練'],
      skill: skillMap['飛輪'],
    },
    {
      name: '晨間瑜珈',
      description: '晨間伸展瑜珈',
      start_at: new Date('2026-09-02 08:00:00'),
      end_at: new Date('2026-09-02 09:00:00'),
      max_participants: 12,
      user: userMap['小美教練'],
      skill: skillMap['瑜珈'],
    },
    {
      name: '核心特訓',
      description: '核心肌群強化特訓',
      start_at: new Date('2026-09-03 19:00:00'),
      end_at: new Date('2026-09-03 20:00:00'),
      max_participants: 8,
      user: userMap['小美教練'],
      skill: skillMap['重訓'],
    }
  ])

  console.log('🌱 seed 完成')
  await dataSource.destroy()
}

main().catch((e) => { console.error('seed 失敗：', e.message); process.exit(1) })

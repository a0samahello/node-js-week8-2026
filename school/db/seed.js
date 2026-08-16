/**
 * 任務 5：Seeder，種一些資料，證明你建立的資料表真的能使用。
 * 規則：可重複執行（先清空、再種入資料），即使執行多次也不會有資料疊加的狀況。
 * 執行順序：一定要先 npm run migration:run（沒有資料表，就無法種資料）
 */
const { dataSource } = require('./data-source')

/** 清空：被 FK 指著的表最後刪（GRADE 先刪，CLASS / SUBJECT 最後刪）。
 *  不用 clear()（TRUNCATE 會被 FK 擋）、不用 delete({})（TypeORM 拒絕空條件）。 */
async function clearAll() {
  const ORDER = [
    // TODO: 按「你的」FK 依賴順序填 entity name（先刪 Grade，再 Student，最後 Class / Subject）
    'Grade',   // Grade 有 student_id 與 subject_id，最先刪除
    'Student', // Student 有 class_id，接著刪除
    'Class',   // Class 被 Student 參照，此時可以安全刪除
    'Subject'  // Subject 被 Grade 參照，此時可以安全刪除
  ]
  for (const name of ORDER) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute()
    }
  }
}

async function main() {
  await dataSource.initialize()
  await clearAll()

  // ================================================================================
  // TODO：依照任務內容的規格種資料（至少 2 班、2 科目、幾位學生、幾筆成績）
  //   1. 先種 CLASS / SUBJECT
  //   2. 再種 STUDENT（記得接上 class）
  //   3. 最後種 GRADE（記得接上 student + subject）
  //      關聯的接法：relation 屬性直接放前面存好的物件（TypeORM 會自動取出 id 填進外鍵），例如：
  //      studentRepo.save({ name: '...', class: 班級物件 })
  //      gradeRepo.save({ score: 95, student: 學生物件, subject: 科目物件 })
  // ================================================================================

  const classRepo = dataSource.getRepository('Class');
// 1. CLASS：至少 2 個班級
  const [classA, classB] = await classRepo.save([
    { name: '一年一班' },
    { name: '一年二班' },
  ]);


  const subjectRepo = dataSource.getRepository('Subject');
  // 2. SUBJECT：至少 2 個科目
  const [Korean, english] = await subjectRepo.save([
    { name: '韓文' },
    { name: '英文' },
  ]);


  const studentRepo = dataSource.getRepository('Student');
  // 3. STUDENT：新增學生，並對應到班級
  const [student1, student2, student3] = await studentRepo.save([
    { name: '呂尚', class: classA },
    { name: '友榮', class: classA },
    { name: '傘', class: classB },
  ]);


  const gradeRepo = dataSource.getRepository('Grade');
  // 4. GRADE：新增成績（能 JOIN 回學生與科目）
  await gradeRepo.save([
    { score: 90, student: student1, subject: Korean },
    { score: 60, student: student1, subject: english },
    { score: 80, student: student2, subject: Korean },
    { score: 70, student: student2, subject: english },
    { score: 90, student: student3, subject: Korean },
    { score: 100, student: student3, subject: english },
  ]);

  console.log('🌱 seed 完成')
  await dataSource.destroy()
}

main().catch((e) => { console.error('seed 失敗：', e.message); process.exit(1) })

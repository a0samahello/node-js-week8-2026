const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Grade',
  tableName: 'GRADE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    score: {
      type: 'integer',
      nullable: false,
    },
    retake_score: {
      type: 'integer',
      nullable: true // nullable: true
    }
  },
  relations: {
    student: {
      target: 'Student',
      type: 'many-to-one',
      joinColumn: {
        name: 'student_id'
      },
      nullable: false,
    },
    subject: {
      target: 'Subject',
      type: 'many-to-one',
      joinColumn: {
        name: 'subject_id'
      },
      nullable: false,
    }
  }
});
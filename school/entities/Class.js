const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Class',
  tableName: 'CLASS',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
    }
  }
});
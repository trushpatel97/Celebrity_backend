exports.up = function(knex) {
  return knex.schema
    .createTable('login', table => {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('hash').notNullable();
      table.timestamps(true, true);
    })
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable()
        .references('email').inTable('login')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.timestamp('joined').defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('login');
};

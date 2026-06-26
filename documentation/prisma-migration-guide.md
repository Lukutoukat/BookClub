If you need to make changes to the database schema, you will have to make those changes to the schema.prisma file and then generate a new migration using the following instruction:

```docker compose run --rm --entrypoint "npx prisma migrate dev --name <name>" backend```

This will generate a new migration with the specified name.
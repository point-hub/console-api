export const seeds = [
  {
    name: 'admin',
    username: 'admin',
    email: 'admin@example.com',
    password: await Bun.password.hash('Admin12#$'),
    created_date: new Date(),
  },
]

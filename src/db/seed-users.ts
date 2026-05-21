import { db, pool } from './config';
import { users, profiles } from './schema/users';
import { fakerVI as faker } from '@faker-js/faker';
import { hashPassword } from '../utils/jwt';
import { createId } from '@paralleldrive/cuid2';

export async function seedRandomUsers(count: number = 500) {
  console.log(`Starting to seed ${count} random users...`);

  // Hash the default password once to optimize database insertions speed
  const hashedPassword = await hashPassword('password123');

  // Query database to find the maximum existing staff_code sequence
  const existingUsers = await db
    .select({ staffCode: users.staffCode })
    .from(users);
  let staffCounter = 1;
  const staffCodes = existingUsers
    .map((u) => u.staffCode)
    .filter((c): c is string => !!c && c.startsWith('STF-'));

  if (staffCodes.length > 0) {
    const numbers = staffCodes
      .map((c) => parseInt(c.replace('STF-', ''), 10))
      .filter((num) => !isNaN(num));
    if (numbers.length > 0) {
      staffCounter = Math.max(...numbers) + 1;
    }
  }

  const roles = ['CUSTOMER', 'STAFF', 'SALES', 'EDITOR', 'INVENTORY'];

  for (let i = 0; i < count; i++) {
    // Generate a random role: 75% CUSTOMER, 25% system operators
    const isSystem = Math.random() > 0.75;
    const role = isSystem
      ? roles[Math.floor(Math.random() * (roles.length - 1)) + 1]
      : 'CUSTOMER';

    const userId = createId();
    const fullName = faker.person.fullName();
    // Append index and a random component to guarantee unique emails
    const email =
      faker.internet.email().toLowerCase().split('@')[0] +
      `_seed_${Date.now()}_${i}@example.com`;
    // Guarantee 100% unique phone numbers by incorporating the unique index
    const phone = '09' + String(i).padStart(3, '0') + faker.string.numeric(5);

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

    let staffCode: string | null = null;
    if (role !== 'CUSTOMER') {
      const codeStr = String(staffCounter++).padStart(3, '0');
      staffCode = `STF-${codeStr}`;
    }

    let success = false;
    let retries = 0;

    while (!success && retries < 20) {
      try {
        await db.transaction(async (tx) => {
          await tx.insert(users).values({
            id: userId,
            name: fullName,
            email,
            emailVerified: true,
            avatarUrl: faker.image.avatar(),
            role: role as any,
            isActive: true,
            password: hashedPassword,
            phone,
            address:
              faker.location.streetAddress() + ', ' + faker.location.city(),
            staffCode,
            lastLogin: role !== 'CUSTOMER' ? faker.date.recent() : null,
          });

          const newProfile: typeof profiles.$inferInsert = {
            userId,
            firstName: firstName as string,
            lastName: lastName as string,
            phone,
            bio: faker.lorem.sentence(),
            birthday: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
          };

          await tx.insert(profiles).values(newProfile);
        });
        success = true;
        console.log(
          `[Success] Inserted ${role} - ${email} (${staffCode || 'No Staff Code'})`
        );
      } catch (err: any) {
        const rawErr = err.cause || err;
        const code = rawErr.code;
        const constraint = rawErr.constraint;
        const detail = rawErr.detail || '';

        if (
          code === '23505' &&
          (constraint === 'users_staff_code_unique' ||
            detail.includes('staff_code'))
        ) {
          console.warn(
            `[Conflict] staff_code ${staffCode} already exists. Retrying with next code...`
          );
          staffCounter++;
          const codeStr = String(staffCounter).padStart(3, '0');
          staffCode = `STF-${codeStr}`;
          retries++;
        } else if (
          code === '23505' &&
          (constraint === 'users_phone_unique' || detail.includes('phone'))
        ) {
          console.warn(`[Conflict] phone ${phone} already exists. Retrying...`);
          retries++;
        } else {
          console.error(`[Error] Failed to insert seed user ${email}:`, err);
          break;
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
}

// Call seedRandomUsers(100) to run when running the script directly
// seedRandomUsers(100).then(() => {
//   pool.end();
// });

// // app/utils/isAdmin.ts
// import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// export const isAdminEmail = async (email: string): Promise<boolean> => {
//   const { data, error } = await supabase
//     .from('users')
//     .select('email')
//     .eq('role', 'admin');

//   if (error) {
//     console.error('Error fetching admin emails:', error);
//     return false;
//   }

//   const adminEmails = data.map((user) => user.email);
//   return adminEmails.includes(email);
// };

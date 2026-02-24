const fs = require('fs');
const files = [
  'app/(auth)/welcome.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/signup.tsx',
  'app/(auth)/forgot-password.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/font-outfit-extrabold/g, 'font-inter-extrabold');
  content = content.replace(/font-outfit-bold/g, 'font-inter-bold');
  content = content.replace(/font-outfit-semibold/g, 'font-inter-semibold');
  content = content.replace(/font-outfit-medium/g, 'font-inter-medium');
  content = content.replace(/font-outfit/g, 'font-inter');
  fs.writeFileSync(file, content);
});
console.log('Inter fonts applied to Auth screens');

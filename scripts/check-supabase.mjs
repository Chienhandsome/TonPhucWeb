import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && key, 'Run with node --env-file=.env.local scripts/check-supabase.mjs');
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const categories = await client.from('categories').select('id, name, slug');
assert.equal(categories.error, null, categories.error?.message);
const posts = await client.from('posts').select('id, slug, published, categories!posts_category_id_fkey(slug, name)');
assert.equal(posts.error, null, posts.error?.message);
assert.ok(posts.data.every(post => post.published), 'Draft exposed to anonymous client');
console.log(JSON.stringify({ categories: categories.data.length, publishedPosts: posts.data.length, relationQuery: 'ok' }));

// An anonymous visitor must not be able to create content or upload images.
const slug = `connection-check-${crypto.randomUUID()}`;
const write = await client.from('posts').insert({ title: 'Connection check', slug, published: false }).select('id');
if (!write.error) {
  throw new Error(`Anonymous write unexpectedly succeeded. Remove test post with slug ${slug} and fix RLS.`);
}
assert.ok(['42501', 'PGRST301'].includes(write.error.code), `Unexpected write failure: ${write.error.message}`);
const upload = await client.storage.from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images')
  .upload(`checks/${slug}.png`, new Uint8Array([137, 80, 78, 71]), { contentType: 'image/png' });
assert.ok(upload.error, `Anonymous upload unexpectedly succeeded: checks/${slug}.png`);
assert.match(upload.error.message, /row.level security|unauthorized|permission denied/i);
console.log('Anonymous content writes and image uploads are denied.');

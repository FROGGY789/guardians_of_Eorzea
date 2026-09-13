import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Modal } from './Modal';
import { Button, Spinner, Badge, SANS, SERIF, KR } from './ui';
import type { GalleryPost, GalleryPhoto } from '../lib/types';

export function GalleryPostModal({
  postId,
  onClose,
  onChanged,
}: {
  postId: string | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { profile, isAdmin } = useAuth();
  const [post, setPost] = useState<GalleryPost | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canManage = !!post && (isAdmin || post.author_id === profile?.id);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    const [{ data: p }, { data: ph }] = await Promise.all([
      supabase.from('gallery_posts').select('*, author:profiles(character_name)').eq('id', postId).maybeSingle(),
      supabase.from('gallery_photos').select('*').eq('post_id', postId).order('sort_order', { ascending: true }),
    ]);
    setPost((p as GalleryPost) ?? null);
    setPhotos((ph as GalleryPhoto[]) ?? []);
    setActive(0);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    if (postId) load();
    else { setPost(null); setPhotos([]); }
  }, [postId, load]);

  async function addPhotos(files: FileList | null) {
    if (!files || !post) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    setBusy(true);
    try {
      const urls = await Promise.all(imgs.map((f) => uploadImage(f, 'gallery')));
      const base = photos.length;
      const rows = urls.map((url, i) => ({ post_id: post.id, image_url: url, sort_order: base + i, caption: null }));
      const { error } = await supabase.from('gallery_photos').insert(rows);
      if (error) throw error;
      await load();
      onChanged();
    } catch (err) {
      alert('사진 추가 실패: ' + (err as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function makeCover(photo: GalleryPhoto) {
    if (!post) return;
    const { error } = await supabase.from('gallery_posts').update({ cover_url: photo.image_url }).eq('id', post.id);
    if (error) return alert(error.message);
    setPost({ ...post, cover_url: photo.image_url });
    onChanged();
  }

  async function deletePhoto(photo: GalleryPhoto) {
    if (photos.length <= 1) return alert('최소 한 장은 남아 있어야 합니다. 게시글을 삭제하려면 아래 버튼을 사용하세요.');
    if (!confirm('이 사진을 삭제할까요?')) return;
    const { error } = await supabase.from('gallery_photos').delete().eq('id', photo.id);
    if (error) return alert(error.message);
    await load();
    onChanged();
  }

  async function deletePost() {
    if (!post) return;
    if (!confirm('게시글 전체를 삭제할까요? 되돌릴 수 없습니다.')) return;
    setBusy(true);
    const { error } = await supabase.from('gallery_posts').delete().eq('id', post.id);
    setBusy(false);
    if (error) return alert(error.message);
    onChanged();
    onClose();
  }

  const current = photos[active];

  return (
    <Modal open={!!postId} onClose={onClose} width={860}>
      {loading || !post ? (
        <Spinner />
      ) : (
        <div>
          {/* Main image */}
          <div style={{ background: 'var(--ink2)', display: 'grid', placeItems: 'center', minHeight: 320, borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
            {current ? (
              <img src={current.image_url} alt={post.title} style={{ width: '100%', maxHeight: '62vh', objectFit: 'contain' }} />
            ) : (
              <span style={{ color: 'var(--faint)', fontFamily: KR, padding: 40 }}>사진이 없습니다</span>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: 'var(--paper2)' }}>
              {photos.map((ph, i) => (
                <button
                  key={ph.id}
                  onClick={() => setActive(i)}
                  style={{
                    flex: '0 0 auto', width: 66, height: 66, padding: 0, cursor: 'pointer',
                    border: `2px solid ${i === active ? 'var(--accent)' : 'transparent'}`,
                    borderRadius: 3, overflow: 'hidden', background: 'none',
                  }}
                >
                  <img src={ph.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ padding: '24px 30px 30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Badge color="var(--w4)">{post.category}</Badge>
              <span style={{ fontFamily: SANS, fontSize: 12, color: 'var(--faint)', letterSpacing: '.06em' }}>
                {formatDate(post.created_at)} · {post.author?.character_name || '알 수 없음'} · 사진 {photos.length}장
              </span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 34, color: 'var(--ink)', marginTop: 10 }}>{post.title}</div>
            {post.location && (
              <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', marginTop: 4, letterSpacing: '.1em' }}>
                {post.location}
              </div>
            )}
            {post.caption && (
              <p style={{ fontFamily: KR, fontWeight: 300, fontSize: 15, color: 'var(--ink2)', lineHeight: 1.9, marginTop: 16 }}>
                {post.caption}
              </p>
            )}

            {canManage && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 12 }}>
                  이 게시글 관리
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
                    {busy ? '처리 중…' : '+ 사진 추가'}
                  </Button>
                  {current && post.cover_url !== current.image_url && (
                    <Button variant="ghost" onClick={() => makeCover(current)}>이 사진을 대표로</Button>
                  )}
                  {current && (
                    <Button variant="ghost" onClick={() => deletePhoto(current)}>현재 사진 삭제</Button>
                  )}
                  <Button variant="ghost" onClick={deletePost} style={{ color: '#b3402b', borderColor: '#e6c3ba' }}>
                    게시글 삭제
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

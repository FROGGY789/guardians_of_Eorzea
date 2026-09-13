import { useState } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Modal } from './Modal';
import { ImagePicker } from './ImagePicker';
import { Button, Field, inputStyle, SANS, SERIF, KR } from './ui';

const CATEGORIES = ['일상', '레이드', '하우징', '기타'];

export function NewPostModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('일상');
  const [files, setFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setTitle(''); setLocation(''); setCaption(''); setCategory('일상');
    setFiles([]); setCoverIndex(0); setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('제목을 입력해주세요.');
    if (files.length === 0) return setError('사진을 한 장 이상 선택해주세요.');
    setBusy(true);
    try {
      // Upload all selected photos.
      const urls = await Promise.all(files.map((f) => uploadImage(f, 'gallery')));
      const cover = urls[Math.min(coverIndex, urls.length - 1)];

      const { data: post, error: postErr } = await supabase
        .from('gallery_posts')
        .insert({
          title: title.trim(),
          location: location.trim() || null,
          caption: caption.trim() || null,
          category,
          cover_url: cover,
          author_id: profile!.id,
        })
        .select()
        .single();
      if (postErr) throw postErr;

      const rows = urls.map((url, i) => ({
        post_id: post.id,
        image_url: url,
        sort_order: i,
        caption: null,
      }));
      const { error: photoErr } = await supabase.from('gallery_photos').insert(rows);
      if (photoErr) throw photoErr;

      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={640}>
      <form onSubmit={submit} style={{ padding: '34px 34px 30px' }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11, letterSpacing: '.4em', color: 'var(--accent)', textTransform: 'uppercase' }}>
          NEW POLAROID
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 34, color: 'var(--ink)', marginTop: 6, marginBottom: 22 }}>
          새 갤러리 게시글
        </div>

        <ImagePicker
          multiple
          onPick={(f) => { setFiles(f); setCoverIndex(0); }}
          label="사진을 끌어다 놓거나 클릭 (여러 장 가능)"
        />
        {files.length > 1 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.14em', color: 'var(--faint)', textTransform: 'uppercase', marginBottom: 8 }}>
              대표 사진 선택 (폴라로이드에 표시됩니다)
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {files.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCoverIndex(i)}
                  style={{
                    width: 64, height: 64, padding: 0, cursor: 'pointer',
                    border: `2px solid ${coverIndex === i ? 'var(--accent)' : 'transparent'}`,
                    borderRadius: 3, overflow: 'hidden', background: 'none',
                  }}
                >
                  <img src={URL.createObjectURL(f)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          <Field label="제목">
            <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 극만신 클리어" maxLength={60} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="장소 / 부제 (선택)">
              <input style={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="예: 코스타 델 솔" maxLength={60} />
            </Field>
            <Field label="분류">
              <select style={{ ...inputStyle, appearance: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="한 줄 메모 (선택)">
            <textarea
              style={{ ...inputStyle, resize: 'vertical', fontFamily: KR }}
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="사진 한 장, 문장 한 줄이면 충분해요."
            />
          </Field>
        </div>

        {error && (
          <div style={{ marginTop: 14, fontFamily: SANS, fontSize: 13, color: '#b3402b' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button type="submit" disabled={busy}>{busy ? '올리는 중…' : '게시글 올리기'}</Button>
        </div>
      </form>
    </Modal>
  );
}

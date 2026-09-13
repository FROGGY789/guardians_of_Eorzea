import { useRef, useState, type CSSProperties } from 'react';
import { SANS, KR, SERIF } from './ui';

/**
 * Click-or-drop image picker. Reports selected File(s) to the parent; actual
 * upload to Supabase Storage happens on form submit.
 */
export function ImagePicker({
  onPick,
  multiple = false,
  height = 260,
  label = '사진을 끌어다 놓거나 클릭해서 선택',
}: {
  onPick: (files: File[]) => void;
  multiple?: boolean;
  height?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);

  function handle(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (arr.length === 0) return;
    const picked = multiple ? arr : [arr[0]];
    setPreview(picked.map((f) => URL.createObjectURL(f)));
    onPick(picked);
  }

  const box: CSSProperties = {
    height,
    border: `1.5px dashed ${drag ? 'var(--accent)' : 'var(--line)'}`,
    borderRadius: 3,
    background: drag ? 'var(--tint)' : 'var(--paper2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all .15s ease',
  };

  return (
    <div
      style={box}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      {preview.length > 0 ? (
        preview.length === 1 ? (
          <img
            src={preview[0]}
            alt="미리보기"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
              gap: 6,
              width: '100%',
              height: '100%',
              padding: 8,
              overflow: 'auto',
            }}
          >
            {preview.map((p, i) => (
              <img
                key={i}
                src={p}
                alt=""
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 2 }}
              />
            ))}
          </div>
        )
      ) : (
        <>
          <div style={{ fontFamily: SERIF, fontSize: 40, color: 'var(--accent)', lineHeight: 1 }}>
            +
          </div>
          <div style={{ fontFamily: KR, fontSize: 13, color: 'var(--muted)' }}>{label}</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: 'var(--faint)', letterSpacing: '.06em' }}>
            {multiple ? '여러 장 선택 가능' : 'JPG · PNG · GIF'}
          </div>
        </>
      )}
    </div>
  );
}

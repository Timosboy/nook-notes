import { detectImageType } from './image-type';

describe('detectImageType', () => {
  it('detects JPEG images', () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe(
      'image/jpeg',
    );
  });

  it('detects PNG images', () => {
    expect(
      detectImageType(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe('image/png');
  });

  it('detects GIF images', () => {
    expect(detectImageType(Buffer.from('GIF89a'))).toBe('image/gif');
  });

  it('detects WebP images', () => {
    expect(detectImageType(Buffer.from('RIFF0000WEBP'))).toBe('image/webp');
  });

  it('returns null for text and empty buffers', () => {
    expect(detectImageType(Buffer.from('plain text'))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
  });
});

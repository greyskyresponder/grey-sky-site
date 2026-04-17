import { describe, it, expect } from 'vitest';
import {
  sanitizeIlikeTerm,
  sanitizeFilterValue,
} from '@/lib/security/sanitize-filter';

describe('sanitizeIlikeTerm', () => {
  it('passes normal search terms through unchanged', () => {
    expect(sanitizeIlikeTerm('NFPA 1006 Rescue Tech')).toBe(
      'NFPA 1006 Rescue Tech',
    );
    expect(sanitizeIlikeTerm('Jean-Luc')).toBe('Jean-Luc');
    expect(sanitizeIlikeTerm("O'Brien")).toBe("O'Brien");
    expect(sanitizeIlikeTerm('john@example')).toBe('john@example');
  });

  it('strips PostgREST field/op separators', () => {
    expect(sanitizeIlikeTerm('foo.eq.bar')).toBe('fooeqbar');
    expect(sanitizeIlikeTerm('x.is.null')).toBe('xisnull');
    expect(sanitizeIlikeTerm('a.not.eq.b')).toBe('anoteqb');
  });

  it('strips grouping operators .or( and .and( and .in(', () => {
    expect(sanitizeIlikeTerm('foo.or(email.eq.a@b')).toBe('foooremaileqa@b');
    expect(sanitizeIlikeTerm('x.and(y.eq.z)')).toBe('xandyeqz');
    expect(sanitizeIlikeTerm('role.in(admin,user)')).toBe('roleinadminuser');
  });

  it('strips ilike wildcards and escape chars', () => {
    expect(sanitizeIlikeTerm('50%')).toBe('50');
    expect(sanitizeIlikeTerm('a,b')).toBe('ab');
    expect(sanitizeIlikeTerm('foo(bar)')).toBe('foobar');
    expect(sanitizeIlikeTerm('a\\b')).toBe('ab');
    expect(sanitizeIlikeTerm('admin!')).toBe('admin');
  });

  it('strips other PostgREST meta-chars (: * = < > ; &)', () => {
    expect(sanitizeIlikeTerm('foo:bar')).toBe('foobar');
    expect(sanitizeIlikeTerm('foo*bar')).toBe('foobar');
    expect(sanitizeIlikeTerm('a=b')).toBe('ab');
    expect(sanitizeIlikeTerm('a<b>c')).toBe('abc');
    expect(sanitizeIlikeTerm('a;b')).toBe('ab');
  });

  it('returns empty string for empty / whitespace-only input', () => {
    expect(sanitizeIlikeTerm('')).toBe('');
    expect(sanitizeIlikeTerm('   ')).toBe('');
    expect(sanitizeIlikeTerm('\t\n')).toBe('');
    expect(sanitizeIlikeTerm('...,,,()')).toBe('');
  });

  it('preserves unicode letters (CJK, Cyrillic, accented Latin)', () => {
    expect(sanitizeIlikeTerm('Müller')).toBe('Müller');
    expect(sanitizeIlikeTerm('Иванов')).toBe('Иванов');
    expect(sanitizeIlikeTerm('山田太郎')).toBe('山田太郎');
    expect(sanitizeIlikeTerm('José García')).toBe('José García');
  });

  it('defeats a realistic injection payload', () => {
    // Attacker tries to pivot from an ilike search into an eq on another user.
    const payload = 'foo%,email.eq.victim@example.com,x.ilike.%';
    const cleaned = sanitizeIlikeTerm(payload);
    expect(cleaned).not.toContain('.');
    expect(cleaned).not.toContain(',');
    expect(cleaned).not.toContain('%');
    expect(cleaned).toBe('fooemaileqvictim@examplecomxilike');
  });
});

describe('sanitizeFilterValue', () => {
  it('passes UUIDs and slugs through unchanged', () => {
    expect(sanitizeFilterValue('6d7c9c1a-4a1b-4f3e-9a21-0c8c3b2e1d77')).toBe(
      '6d7c9c1a-4a1b-4f3e-9a21-0c8c3b2e1d77',
    );
    expect(sanitizeFilterValue('user_123')).toBe('user_123');
  });

  it('strips any filter-structure character', () => {
    expect(sanitizeFilterValue('abc.eq.def')).toBe('abceqdef');
    expect(sanitizeFilterValue('id,other.eq.1')).toBe('idothereq1');
    expect(sanitizeFilterValue('a(b)c')).toBe('abc');
    expect(sanitizeFilterValue("abc'%!\\")).toBe('abc');
  });

  it('returns empty string for empty / all-invalid input', () => {
    expect(sanitizeFilterValue('')).toBe('');
    expect(sanitizeFilterValue('...')).toBe('');
    expect(sanitizeFilterValue('   ')).toBe('');
  });
});

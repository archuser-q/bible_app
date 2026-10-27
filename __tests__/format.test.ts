import { chapterRange, filterBooks, formatDate, groupByTestament, reference, stripMarkdown } from '../src/utils/format';
import { books } from './helpers';

describe('format utils', () => {
  it('reference', () => {
    expect(reference('John', 3, 16)).toBe('John 3:16');
    expect(reference('John', 3)).toBe('John 3');
  });
  it('groupByTestament tách Cựu/Tân Ước và bỏ nhóm rỗng', () => {
    expect(groupByTestament(books as any).map((s) => [s.title, s.data.length])).toEqual([['Cựu Ước', 2], ['Tân Ước', 1]]);
    expect(groupByTestament([books[2]] as any).map((s) => s.title)).toEqual(['Tân Ước']);
  });
  it('filterBooks không phân biệt hoa thường', () => {
    expect(filterBooks(books as any, '  JO ').map((b) => b.name)).toEqual(['John']);
    expect(filterBooks(books as any, '')).toHaveLength(3);
  });
  it('chapterRange', () => expect(chapterRange(3)).toEqual([1, 2, 3]));
  it('stripMarkdown', () => expect(stripMarkdown('## Title\n**bold** and *it*')).toBe('Title\nbold and it'));
  it('formatDate', () => expect(formatDate('2026-01-05T10:00:00')).toBe('05/01/2026'));
});

import type {ContentBlock} from '@/lib/catalog';

export default function ContentBlocks({blocks}: {blocks: ContentBlock[]}) {
  return <div className="prose-content">{blocks.map((block, index) => {
    if (block.type === 'image' && block.src) return <figure key={index}><img src={block.src} alt={block.text || ''} loading="lazy" /><figcaption>{block.text}</figcaption></figure>;
    if (block.type === 'heading') return <h2 key={index}>{block.text}</h2>;
    if (block.type === 'list') return <p className="content-list-item" key={index}>{block.text}</p>;
    if (block.type === 'table') return <div className="table-scroll" key={index}><table><tbody>{block.rows?.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
    return <p key={index}>{block.text}</p>;
  })}</div>;
}
